import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hora, primerSolape, solapa } from "@congresalia/domain";
import { conflicto, createTRPCRouter, roleProcedure, type Contexto } from "~/server/api/trpc";

const SIN_INSCRIPCION = "Necesitas una inscripción confirmada en este congreso";

/** Inscripción confirmada del usuario en el congreso (FR-001). */
async function inscripcionConfirmada(ctx: Contexto & { usuario: { id: string } }, congresoId: string) {
  const ins = await ctx.db.inscripcion.findUnique({
    where: { congresoId_usuarioId: { congresoId, usuarioId: ctx.usuario.id } },
    select: { id: true, estado: true },
  });
  if (!ins || ins.estado !== "CONFIRMADA") throw new TRPCError({ code: "FORBIDDEN", message: SIN_INSCRIPCION });
  return ins;
}

/** spec-005 · router `agenda` (contracts/agenda.md). */
export const agendaRouter = createTRPCRouter({
  /** Punto de entrada: congresos con inscripción confirmada. */
  congresos: roleProcedure("ASISTENTE").query(async ({ ctx }) => {
    const r = await ctx.db.inscripcion.findMany({
      where: { usuarioId: ctx.usuario.id, estado: "CONFIRMADA" },
      select: { congreso: { select: { slug: true, nombre: true } } },
      orderBy: { congreso: { inicio: "asc" } },
    });
    return r.map((x) => x.congreso);
  }),

  /** FR-007: programa publicado con plazas libres, completa, en agenda y empezada. */
  sesiones: roleProcedure("ASISTENTE")
    .input(z.object({ congresoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ins = await inscripcionConfirmada(ctx, input.congresoId);
      const c = await ctx.db.congreso.findUniqueOrThrow({ where: { id: input.congresoId }, select: { estadoPrograma: true } });
      if (c.estadoPrograma !== "PUBLICADO") return { publicado: false as const, sesiones: [] };
      const ahora = ctx.ahora();
      const ss = await ctx.db.sesion.findMany({
        where: { congresoId: input.congresoId },
        orderBy: [{ inicio: "asc" }, { sala: { nombre: "asc" } }],
        select: {
          id: true,
          inicio: true,
          fin: true,
          sala: { select: { nombre: true, aforo: true } },
          propuesta: { select: { titulo: true, autor: { select: { nombre: true } } } },
          _count: { select: { agendas: true } },
          agendas: { where: { inscripcionId: ins.id }, select: { id: true } },
        },
      });
      return {
        publicado: true as const,
        sesiones: ss.map((s) => {
          const plazasLibres = Math.max(0, s.sala.aforo - s._count.agendas);
          return {
            id: s.id,
            titulo: s.propuesta.titulo,
            ponente: s.propuesta.autor.nombre,
            sala: s.sala.nombre,
            inicio: s.inicio,
            fin: s.fin,
            aforo: s.sala.aforo,
            plazasLibres,
            completa: plazasLibres === 0,
            enAgenda: s.agendas.length > 0,
            empezada: s.inicio <= ahora,
          };
        }),
      };
    }),

  /** FR-001…FR-005: bloqueo inscripción → sesión y validación en el orden del plan (R1, R2). */
  anadir: roleProcedure("ASISTENTE")
    .input(z.object({ sesionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sesion = await ctx.db.sesion.findUnique({ where: { id: input.sesionId }, select: { congresoId: true } });
      if (!sesion) throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
      const ins = await inscripcionConfirmada(ctx, sesion.congresoId);
      await ctx.db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Inscripcion" WHERE id = ${ins.id} FOR UPDATE`;
        await tx.$queryRaw`SELECT id FROM "Sesion" WHERE id = ${input.sesionId} FOR UPDATE`;
        const s = await tx.sesion.findUniqueOrThrow({
          where: { id: input.sesionId },
          select: { inicio: true, fin: true, sala: { select: { aforo: true } }, congreso: { select: { estadoPrograma: true, zonaHoraria: true } } },
        });
        if (s.congreso.estadoPrograma !== "PUBLICADO") conflicto("El programa aún no se ha publicado");
        if (s.inicio <= ctx.ahora()) conflicto("La sesión ya ha empezado");
        const mias = await tx.entradaAgenda.findMany({
          where: { inscripcionId: ins.id },
          select: { sesionId: true, sesion: { select: { inicio: true, fin: true, propuesta: { select: { titulo: true } } } } },
        });
        if (mias.some((m) => m.sesionId === input.sesionId)) conflicto("Esta sesión ya está en tu agenda");
        const choque = primerSolape(s, mias.map((m) => ({ ...m.sesion })));
        if (choque) conflicto(`Se solapa con «${choque.propuesta.titulo}» de ${hora(choque.inicio, s.congreso.zonaHoraria)} a ${hora(choque.fin, s.congreso.zonaHoraria)}`);
        const reservas = await tx.entradaAgenda.count({ where: { sesionId: input.sesionId } });
        if (reservas >= s.sala.aforo) conflicto("Aforo completo");
        await tx.entradaAgenda.create({ data: { inscripcionId: ins.id, sesionId: input.sesionId, anadidaEn: ctx.ahora() } });
      });
      return { ok: true as const };
    }),

  /** FR-006: solo entradas propias de sesiones no empezadas. */
  quitar: roleProcedure("ASISTENTE")
    .input(z.object({ sesionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entrada = await ctx.db.entradaAgenda.findFirst({
        where: { sesionId: input.sesionId, inscripcion: { usuarioId: ctx.usuario.id } },
        select: { id: true, sesion: { select: { inicio: true } } },
      });
      if (!entrada) throw new TRPCError({ code: "NOT_FOUND", message: "Esta sesión no está en tu agenda" });
      if (entrada.sesion.inicio <= ctx.ahora()) conflicto("La sesión ya ha empezado: no se puede quitar de la agenda");
      await ctx.db.entradaAgenda.delete({ where: { id: entrada.id } });
      return { ok: true as const };
    }),

  /** US2-1 y FR-009: agenda por hora con aviso de solapes por cambios del programa (clarify P1). */
  mia: roleProcedure("ASISTENTE")
    .input(z.object({ congresoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const es = await ctx.db.entradaAgenda.findMany({
        where: { inscripcion: { usuarioId: ctx.usuario.id, congresoId: input.congresoId } },
        select: { sesion: { select: { id: true, inicio: true, fin: true, sala: { select: { nombre: true } }, propuesta: { select: { titulo: true } } } } },
        orderBy: { sesion: { inicio: "asc" } },
      });
      const ahora = ctx.ahora();
      return es.map(({ sesion: s }) => ({
        sesionId: s.id,
        titulo: s.propuesta.titulo,
        sala: s.sala.nombre,
        inicio: s.inicio,
        fin: s.fin,
        empezada: s.inicio <= ahora,
        solapaCon: es.filter((o) => o.sesion.id !== s.id && solapa(o.sesion, s)).map((o) => o.sesion.propuesta.titulo),
      }));
    }),
});
