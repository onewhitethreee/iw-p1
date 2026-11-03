import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { estadoTrasAsignar, estaDecidida, puedeDecidir, type EstadoPropuesta } from "@congresalia/domain";
import { conflicto, createTRPCRouter, roleProcedure, type Contexto } from "~/server/api/trpc";
import { evaluacionSchema } from "~/lib/esquemas/evaluacion";

/**
 * spec-002 · Vista anónima (FR-005, plan R1): lo único que el comité puede leer de una propuesta.
 * Nunca incluye `autorId` ni la relación `autor`. Todas las consultas del comité usan este `select`.
 */
export const SELECT_ANONIMO = {
  titulo: true,
  resumen: true,
  estado: true,
  area: { select: { nombre: true } },
  congreso: { select: { nombre: true, slug: true } },
} as const;

const NO_ASIGNADA = "No tienes asignada esta propuesta";
const YA_DECIDIDA = "La propuesta ya está decidida";

type Tx = Prisma.TransactionClient;

/** Plan R4 (revisado tras analyze U1): bloquea la fila de la propuesta hasta el final de la transacción. */
async function bloquearPropuesta(tx: Tx, propuestaId: string): Promise<{ estado: EstadoPropuesta } | null> {
  const filas = await tx.$queryRaw<{ estado: EstadoPropuesta }[]>`
    SELECT estado FROM "Propuesta" WHERE id = ${propuestaId} FOR UPDATE`;
  return filas[0] ?? null;
}

/** La asignación debe existir y ser del usuario; si no, FORBIDDEN sin revelar si existe (R2). */
async function asignacionPropia(ctx: Contexto & { usuario: { id: string } }, asignacionId: string) {
  const a = await ctx.db.asignacion.findUnique({ where: { id: asignacionId }, select: { id: true, evaluadorId: true, propuestaId: true } });
  if (!a || a.evaluadorId !== ctx.usuario.id) throw new TRPCError({ code: "FORBIDDEN", message: NO_ASIGNADA });
  return a;
}

export const evaluacionRouter = createTRPCRouter({
  // ───────────────────────── US1 · Comité (vista anónima) ─────────────────────────

  /** FR-004: solo sus asignaciones; FR-005: sin autor. */
  misAsignaciones: roleProcedure("COMITE")
    .input(z.object({ congresoId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const asignaciones = await ctx.db.asignacion.findMany({
        where: { evaluadorId: ctx.usuario.id, ...(input.congresoId ? { propuesta: { congresoId: input.congresoId } } : {}) },
        orderBy: { asignadaEn: "desc" },
        select: {
          id: true,
          evaluacion: { select: { puntuacion: true } },
          propuesta: { select: { titulo: true, estado: true, area: SELECT_ANONIMO.area, congreso: SELECT_ANONIMO.congreso } },
        },
      });
      return asignaciones.map((a) => ({
        asignacionId: a.id,
        evaluada: a.evaluacion !== null,
        puntuacion: a.evaluacion?.puntuacion ?? null,
        propuesta: a.propuesta,
      }));
    }),

  detalle: roleProcedure("COMITE")
    .input(z.object({ asignacionId: z.string() }))
    .query(async ({ ctx, input }) => {
      await asignacionPropia(ctx, input.asignacionId);
      const a = await ctx.db.asignacion.findUniqueOrThrow({
        where: { id: input.asignacionId },
        select: { id: true, propuesta: { select: SELECT_ANONIMO }, evaluacion: { select: { puntuacion: true, comentarios: true } } },
      });
      return { asignacionId: a.id, propuesta: a.propuesta, evaluacion: a.evaluacion };
    }),

  /** FR-006: una por asignación (upsert), modificable hasta la decisión, sin carreras con `decidir`. */
  evaluar: roleProcedure("COMITE")
    .input(evaluacionSchema)
    .mutation(async ({ ctx, input }) => {
      const a = await asignacionPropia(ctx, input.asignacionId);
      await ctx.db.$transaction(async (tx) => {
        const p = await bloquearPropuesta(tx, a.propuestaId);
        if (!p || estaDecidida(p.estado)) conflicto(YA_DECIDIDA);
        await tx.evaluacion.upsert({
          where: { asignacionId: a.id },
          create: { asignacionId: a.id, puntuacion: input.puntuacion, comentarios: input.comentarios, evaluadaEn: ctx.ahora() },
          update: { puntuacion: input.puntuacion, comentarios: input.comentarios, evaluadaEn: ctx.ahora() },
        });
      });
      return { ok: true as const };
    }),

  // ───────────────────────── US2 · Asignar (organizador) ─────────────────────────

  miembrosComite: roleProcedure("ORGANIZADOR").query(({ ctx }) =>
    ctx.db.usuario.findMany({ where: { roles: { some: { rol: "COMITE" } } }, select: { id: true, nombre: true }, orderBy: { nombre: "asc" } }),
  ),

  /** FR-001…FR-003: solo comité, nunca el autor, nunca dos veces; ENVIADA → EN_EVALUACION. */
  asignar: roleProcedure("ORGANIZADOR")
    .input(z.object({ propuestaId: z.string(), evaluadorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const propuesta = await ctx.db.propuesta.findUnique({ where: { id: input.propuestaId }, select: { id: true, autorId: true } });
      if (!propuesta) throw new TRPCError({ code: "NOT_FOUND", message: "Propuesta no encontrada" });
      const esComite = await ctx.db.usuarioRol.findUnique({ where: { usuarioId_rol: { usuarioId: input.evaluadorId, rol: "COMITE" } } });
      if (!esComite) throw new TRPCError({ code: "BAD_REQUEST", message: "El usuario no pertenece al comité científico" });
      if (propuesta.autorId === input.evaluadorId) conflicto("Un evaluador no puede evaluar su propia propuesta");

      try {
        return await ctx.db.$transaction(async (tx) => {
          const p = await bloquearPropuesta(tx, propuesta.id);
          if (!p || estaDecidida(p.estado)) conflicto(YA_DECIDIDA);
          const estado = estadoTrasAsignar(p.estado);
          await tx.asignacion.create({ data: { propuestaId: propuesta.id, evaluadorId: input.evaluadorId, asignadaEn: ctx.ahora() } });
          await tx.propuesta.update({ where: { id: propuesta.id }, data: { estado } });
          return { estado };
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") conflicto("Ese evaluador ya tiene asignada esta propuesta");
        throw e;
      }
    }),

  /** FR-008: el organizador sí ve al autor (Edge Case), el número de evaluaciones y la media. */
  resumenOrganizador: roleProcedure("ORGANIZADOR")
    .input(z.object({ congresoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const propuestas = await ctx.db.propuesta.findMany({
        where: { congresoId: input.congresoId },
        orderBy: { enviadaEn: "asc" },
        select: {
          id: true,
          titulo: true,
          estado: true,
          area: { select: { nombre: true } },
          autor: { select: { nombre: true } },
          asignaciones: {
            orderBy: { asignadaEn: "asc" },
            select: { evaluador: { select: { id: true, nombre: true } }, evaluacion: { select: { puntuacion: true } } },
          },
        },
      });
      return propuestas.map(({ asignaciones, ...p }) => {
        const notas = asignaciones.flatMap((a) => (a.evaluacion ? [a.evaluacion.puntuacion] : []));
        const media = notas.length ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10 : null;
        return {
          ...p,
          nEvaluaciones: notas.length,
          media,
          evaluadores: asignaciones.map((a) => ({ id: a.evaluador.id, nombre: a.evaluador.nombre, evaluada: a.evaluacion !== null })),
        };
      });
    }),

  // ───────────────────────── US3 · Decidir (organizador) ─────────────────────────

  /** FR-007, FR-011: ≥ 2 evaluaciones, sin nota mínima, definitiva; bloqueo contra carreras (R4). */
  decidir: roleProcedure("ORGANIZADOR")
    .input(z.object({ propuestaId: z.string(), decision: z.enum(["ACEPTAR", "RECHAZAR"]) }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.$transaction(async (tx) => {
        const p = await bloquearPropuesta(tx, input.propuestaId);
        if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Propuesta no encontrada" });
        const n = await tx.evaluacion.count({ where: { asignacion: { propuestaId: input.propuestaId } } });
        const r = puedeDecidir(p.estado, n);
        if (!r.ok) conflicto(r.motivo);
        const estado = input.decision === "ACEPTAR" ? "ACEPTADA" : "RECHAZADA";
        await tx.propuesta.update({ where: { id: input.propuestaId }, data: { estado, decididaEn: ctx.ahora() } });
        return { estado };
      }),
    ),
});
