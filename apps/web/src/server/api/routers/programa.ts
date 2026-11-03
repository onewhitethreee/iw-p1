import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { congresoFinalizado, diaLocal, hora, instanteLocal, intervaloValido, primerSolape, type Intervalo } from "@congresalia/domain";
import { conflicto, createTRPCRouter, publicProcedure, roleProcedure } from "~/server/api/trpc";
import { moverSchema, programarSchema } from "~/lib/esquemas/programa";

type Tx = Prisma.TransactionClient;

const FINALIZADO = "El congreso ha finalizado: el programa ya no se puede modificar";
const EMPEZADA = "La sesión ya ha empezado: solo se puede cambiar de sala";
const MALA_HORA = "La hora de fin debe ser posterior a la de inicio";

interface CongresoBloqueado {
  id: string;
  zonaHoraria: string;
  inicio: Date;
  fin: Date;
}

/** Plan R1: bloquea el congreso para serializar los cambios de su programa (SC-001). */
async function bloquearCongreso(tx: Tx, congresoId: string): Promise<CongresoBloqueado> {
  const [c] = await tx.$queryRaw<CongresoBloqueado[]>`
    SELECT id, "zonaHoraria", inicio, fin FROM "Congreso" WHERE id = ${congresoId} FOR UPDATE`;
  if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });
  return c;
}

/** Convierte el horario local (clarify P2) y valida fin > inicio, mismo día (P3) y fechas del congreso (FR-003). */
function horarioAIntervalo(c: CongresoBloqueado, h: { dia: string; horaInicio: string; horaFin: string }): Intervalo {
  const inicio = instanteLocal(`${h.dia}T${h.horaInicio}`, c.zonaHoraria);
  const fin = instanteLocal(`${h.dia}T${h.horaFin}`, c.zonaHoraria);
  if (!intervaloValido({ inicio, fin })) throw new TRPCError({ code: "BAD_REQUEST", message: MALA_HORA });
  if (inicio < c.inicio || fin > c.fin) throw new TRPCError({ code: "BAD_REQUEST", message: "La sesión debe estar dentro de las fechas del congreso" });
  return { inicio, fin };
}

/** FR-004/FR-005/FR-008: primero solape de ponente, después de sala; el mensaje identifica la sesión. */
async function comprobarSolapes(
  tx: Tx,
  c: CongresoBloqueado,
  nuevo: Intervalo & { salaId: string; autorId: string; excluirId?: string },
) {
  const candidatas = await tx.sesion.findMany({
    where: {
      congresoId: c.id,
      id: nuevo.excluirId ? { not: nuevo.excluirId } : undefined,
      OR: [{ salaId: nuevo.salaId }, { propuesta: { autorId: nuevo.autorId } }],
    },
    select: { inicio: true, fin: true, salaId: true, sala: { select: { nombre: true } }, propuesta: { select: { titulo: true, autorId: true, autor: { select: { nombre: true } } } } },
  });
  const z = c.zonaHoraria;
  const dePonente = primerSolape(nuevo, candidatas.filter((s) => s.propuesta.autorId === nuevo.autorId));
  if (dePonente) conflicto(`${dePonente.propuesta.autor.nombre} ya tiene la sesión «${dePonente.propuesta.titulo}» de ${hora(dePonente.inicio, z)} a ${hora(dePonente.fin, z)}`);
  const deSala = primerSolape(nuevo, candidatas.filter((s) => s.salaId === nuevo.salaId));
  if (deSala) conflicto(`La sala ${deSala.sala.nombre} está ocupada por «${deSala.propuesta.titulo}» de ${hora(deSala.inicio, z)} a ${hora(deSala.fin, z)}`);
}

async function salaDelCongreso(tx: Tx, salaId: string, congresoId: string) {
  const sala = await tx.sala.findUnique({ where: { id: salaId }, select: { id: true, nombre: true, aforo: true, congresoId: true } });
  if (!sala || sala.congresoId !== congresoId) throw new TRPCError({ code: "BAD_REQUEST", message: "La sala no pertenece a este congreso" });
  return sala;
}

async function cargarSesion(tx: Tx, sesionId: string) {
  const s = await tx.sesion.findUnique({
    where: { id: sesionId },
    select: { id: true, congresoId: true, salaId: true, inicio: true, fin: true, propuesta: { select: { autorId: true } }, _count: { select: { agendas: true, asistencias: true } } },
  });
  if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
  return s;
}

export const programaRouter = createTRPCRouter({
  // ─────────────── US1 · Programar (organizador) ───────────────

  pendientes: roleProcedure("ORGANIZADOR")
    .input(z.object({ congresoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ps = await ctx.db.propuesta.findMany({
        where: { congresoId: input.congresoId, estado: "ACEPTADA", sesion: null },
        orderBy: { titulo: "asc" },
        select: { id: true, titulo: true, autor: { select: { nombre: true } }, area: { select: { nombre: true } } },
      });
      return ps.map(({ id, ...p }) => ({ propuestaId: id, ...p }));
    }),

  sesiones: roleProcedure("ORGANIZADOR")
    .input(z.object({ congresoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ss = await ctx.db.sesion.findMany({
        where: { congresoId: input.congresoId },
        orderBy: [{ inicio: "asc" }, { sala: { nombre: "asc" } }],
        select: {
          id: true,
          inicio: true,
          fin: true,
          sala: { select: { id: true, nombre: true, aforo: true } },
          propuesta: { select: { titulo: true, autor: { select: { nombre: true } } } },
          _count: { select: { agendas: true, asistencias: true } },
        },
      });
      return ss.map(({ _count, ...s }) => ({ ...s, reservas: _count.agendas, asistencias: _count.asistencias }));
    }),

  /** FR-001…FR-005, FR-008, FR-012, FR-014. */
  programar: roleProcedure("ORGANIZADOR")
    .input(programarSchema)
    .mutation(async ({ ctx, input }) => {
      const propuesta = await ctx.db.propuesta.findUnique({ where: { id: input.propuestaId }, select: { id: true, congresoId: true, estado: true, autorId: true } });
      if (!propuesta) throw new TRPCError({ code: "NOT_FOUND", message: "Propuesta no encontrada" });
      try {
        return await ctx.db.$transaction(async (tx) => {
          const c = await bloquearCongreso(tx, propuesta.congresoId);
          if (congresoFinalizado(c, ctx.ahora())) conflicto(FINALIZADO);
          if (propuesta.estado !== "ACEPTADA") conflicto("Solo se pueden programar ponencias aceptadas");
          if (await tx.sesion.findUnique({ where: { propuestaId: propuesta.id }, select: { id: true } })) conflicto("Esta ponencia ya está programada");
          const sala = await salaDelCongreso(tx, input.salaId, c.id);
          const iv = horarioAIntervalo(c, input);
          await comprobarSolapes(tx, c, { ...iv, salaId: sala.id, autorId: propuesta.autorId });
          const s = await tx.sesion.create({ data: { congresoId: c.id, propuestaId: propuesta.id, salaId: sala.id, ...iv }, select: { id: true } });
          return s;
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") conflicto("Esta ponencia ya está programada");
        throw e;
      }
    }),

  // ─────────────── US2 · Modificar (organizador) ───────────────

  /** FR-004…FR-006, FR-012, FR-013. */
  mover: roleProcedure("ORGANIZADOR")
    .input(moverSchema)
    .mutation(async ({ ctx, input }) => {
      const previa = await ctx.db.sesion.findUnique({ where: { id: input.sesionId }, select: { congresoId: true } });
      if (!previa) throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
      return ctx.db.$transaction(async (tx) => {
        const c = await bloquearCongreso(tx, previa.congresoId);
        const ahora = ctx.ahora();
        if (congresoFinalizado(c, ahora)) conflicto(FINALIZADO);
        const s = await cargarSesion(tx, input.sesionId);
        const cambiaHorario = input.dia !== undefined;
        if (cambiaHorario && s.inicio <= ahora) conflicto(EMPEZADA);
        const iv = cambiaHorario ? horarioAIntervalo(c, { dia: input.dia!, horaInicio: input.horaInicio!, horaFin: input.horaFin! }) : { inicio: s.inicio, fin: s.fin };
        const salaId = input.salaId ?? s.salaId;
        if (input.salaId && input.salaId !== s.salaId) {
          const sala = await salaDelCongreso(tx, input.salaId, c.id);
          if (sala.aforo < s._count.agendas) conflicto(`La sala ${sala.nombre} tiene aforo ${sala.aforo} y la sesión tiene ${s._count.agendas} reservas`);
        }
        await comprobarSolapes(tx, c, { ...iv, salaId, autorId: s.propuesta.autorId, excluirId: s.id });
        await tx.sesion.update({ where: { id: s.id }, data: { salaId, ...iv } });
        return { id: s.id };
      });
    }),

  /** FR-007, FR-012, FR-013. */
  quitar: roleProcedure("ORGANIZADOR")
    .input(z.object({ sesionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const previa = await ctx.db.sesion.findUnique({ where: { id: input.sesionId }, select: { congresoId: true } });
      if (!previa) throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
      return ctx.db.$transaction(async (tx) => {
        const c = await bloquearCongreso(tx, previa.congresoId);
        const ahora = ctx.ahora();
        if (congresoFinalizado(c, ahora)) conflicto(FINALIZADO);
        const s = await cargarSesion(tx, input.sesionId);
        if (s.inicio <= ahora) conflicto(EMPEZADA);
        if (s._count.agendas > 0 || s._count.asistencias > 0)
          conflicto(`No se puede quitar: la sesión tiene ${s._count.agendas} reservas y ${s._count.asistencias} asistencias`);
        await tx.sesion.delete({ where: { id: s.id } });
        return { ok: true as const };
      });
    }),

  // ─────────────── US3 · Publicar y páginas públicas ───────────────

  publicar: roleProcedure("ORGANIZADOR")
    .input(z.object({ congresoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const c = await ctx.db.congreso.findUnique({ where: { id: input.congresoId }, select: { estadoPrograma: true, publicadoEn: true } });
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });
      if (c.estadoPrograma === "PUBLICADO") return c; // idempotente (R6)
      return ctx.db.congreso.update({
        where: { id: input.congresoId },
        data: { estadoPrograma: "PUBLICADO", publicadoEn: ctx.ahora() },
        select: { estadoPrograma: true, publicadoEn: true },
      });
    }),

  /** FR-009, FR-010: público; sin sesiones en borrador; solo datos públicos. */
  publico: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const c = await ctx.db.congreso.findUnique({
      where: { slug: input.slug },
      select: { id: true, slug: true, nombre: true, descripcion: true, sede: true, zonaHoraria: true, inicio: true, fin: true, estadoPrograma: true },
    });
    if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });
    const { estadoPrograma, ...congreso } = c;
    if (estadoPrograma !== "PUBLICADO") return { congreso, publicado: false as const };
    const sesiones = await ctx.db.sesion.findMany({
      where: { congresoId: c.id },
      orderBy: [{ inicio: "asc" }, { sala: { nombre: "asc" } }],
      select: {
        id: true,
        inicio: true,
        fin: true,
        sala: { select: { nombre: true } },
        propuesta: { select: { titulo: true, area: { select: { nombre: true } }, autor: { select: { nombre: true } } } },
      },
    });
    const dias: { dia: string; sesiones: { id: string; inicio: Date; fin: Date; titulo: string; sala: string; area: string; ponente: string }[] }[] = [];
    for (const s of sesiones) {
      const dia = diaLocal(s.inicio, c.zonaHoraria);
      let grupo = dias.at(-1);
      if (grupo?.dia !== dia) dias.push((grupo = { dia, sesiones: [] }));
      grupo.sesiones.push({ id: s.id, inicio: s.inicio, fin: s.fin, titulo: s.propuesta.titulo, sala: s.sala.nombre, area: s.propuesta.area.nombre, ponente: s.propuesta.autor.nombre });
    }
    return { congreso, publicado: true as const, dias };
  }),

  /** US3-5: detalle indexable de una sesión publicada. */
  sesionPublica: publicProcedure.input(z.object({ slug: z.string(), sesionId: z.string() })).query(async ({ ctx, input }) => {
    const s = await ctx.db.sesion.findFirst({
      where: { id: input.sesionId, congreso: { slug: input.slug, estadoPrograma: "PUBLICADO" } },
      select: {
        id: true,
        inicio: true,
        fin: true,
        sala: { select: { nombre: true } },
        congreso: { select: { slug: true, nombre: true, sede: true, zonaHoraria: true } },
        propuesta: { select: { titulo: true, resumen: true, area: { select: { nombre: true } }, autor: { select: { nombre: true } } } },
      },
    });
    if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
    return {
      id: s.id,
      inicio: s.inicio,
      fin: s.fin,
      titulo: s.propuesta.titulo,
      resumen: s.propuesta.resumen,
      area: s.propuesta.area.nombre,
      ponente: s.propuesta.autor.nombre,
      sala: s.sala.nombre,
      congreso: s.congreso,
    };
  }),
});
