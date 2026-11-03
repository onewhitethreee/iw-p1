import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { calcularCertificado } from "~/server/certificado";

/**
 * HU-07: certificado de asistencia (contrato en specs/007-certificado-asistencia/contracts/certificado.md).
 * Sin comprobación de rol: solo se calcula sobre la inscripción del propio usuario (clarify P1).
 */
export const certificadoRouter = createTRPCRouter({
  /** Congresos con inscripción confirmada del usuario. */
  congresos: protectedProcedure.query(async ({ ctx }) => {
    const ahora = ctx.ahora();
    const ins = await ctx.db.inscripcion.findMany({
      where: { usuarioId: ctx.usuario.id, estado: "CONFIRMADA" },
      select: { congreso: { select: { id: true, slug: true, nombre: true, fin: true, zonaHoraria: true } } },
      orderBy: { congreso: { inicio: "desc" } },
    });
    return ins.map(({ congreso: c }) => ({ ...c, finalizado: ahora >= c.fin }));
  }),

  /** Estado del certificado (FR-001…FR-003, FR-006). */
  estado: protectedProcedure.input(z.object({ congresoId: z.string().min(1) })).query(async ({ ctx, input }) => {
    const r = await calcularCertificado(ctx.db, ctx.usuario.id, input.congresoId, ctx.ahora());
    if (!r) throw new TRPCError({ code: "NOT_FOUND", message: "El congreso no existe" });
    const { estado, disponible, motivo, porcentaje, asistidas, total, horas, sesiones } = r;
    return { estado, disponible, motivo, porcentaje, asistidas, total, horas, sesiones };
  }),
});
