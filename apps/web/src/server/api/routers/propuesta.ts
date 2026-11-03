import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { fecha, plazoEnvio } from "@congresalia/domain";
import { conflicto, createTRPCRouter, roleProcedure } from "~/server/api/trpc";
import { propuestaSchema } from "~/lib/esquemas/propuesta";

/** spec-001 · router `propuesta` (contracts/propuesta.md). Sin editar ni retirar (clarify P1, FR-008). */
export const propuestaRouter = createTRPCRouter({
  /** US1 · FR-001…FR-006. Todas las reglas se comprueban aquí (Constitución IV). */
  enviar: roleProcedure("PONENTE")
    .input(propuestaSchema)
    .mutation(async ({ ctx, input }) => {
      const congreso = await ctx.db.congreso.findUnique({
        where: { id: input.congresoId },
        select: { id: true, envioAbre: true, envioCierra: true, zonaHoraria: true },
      });
      if (!congreso) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });

      const ahora = ctx.ahora();
      const plazo = plazoEnvio(congreso, ahora); // [envioAbre, envioCierra): días completos (FR-005a)
      if (plazo === "NO_ABIERTO") conflicto(`El plazo de envío de este congreso se abre el ${fecha(congreso.envioAbre, congreso.zonaHoraria)}`);
      if (plazo === "CERRADO") conflicto("El plazo de envío de propuestas de este congreso está cerrado");

      const area = await ctx.db.areaTematica.findFirst({ where: { id: input.areaId, congresoId: congreso.id }, select: { id: true } });
      if (!area) throw new TRPCError({ code: "BAD_REQUEST", message: "El área temática no pertenece a este congreso" });

      const p = await ctx.db.propuesta.create({
        data: {
          congresoId: congreso.id,
          areaId: area.id,
          autorId: ctx.usuario.id, // FR-004: nunca se acepta el autor desde la entrada
          titulo: input.titulo,
          resumen: input.resumen,
          estado: "ENVIADA",
          enviadaEn: ahora,
        },
        select: { id: true, estado: true },
      });
      return p;
    }),

  /** US2 · FR-005, FR-010: solo las propias y solo los campos permitidos (sin datos de evaluación). */
  mias: roleProcedure("PONENTE")
    .input(z.object({ congresoId: z.string().optional() }).optional())
    .query(({ ctx, input }) =>
      ctx.db.propuesta.findMany({
        where: { autorId: ctx.usuario.id, ...(input?.congresoId ? { congresoId: input.congresoId } : {}) },
        orderBy: { enviadaEn: "desc" },
        select: {
          id: true,
          titulo: true,
          resumen: true,
          estado: true,
          enviadaEn: true,
          area: { select: { nombre: true } },
          congreso: { select: { nombre: true, slug: true, zonaHoraria: true } },
        },
      }),
    ),
});
