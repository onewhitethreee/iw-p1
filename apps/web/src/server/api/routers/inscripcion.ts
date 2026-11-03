import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { calcularTarifa, congresoFinalizado, type TipoAsistente } from "@congresalia/domain";
import { conflicto, createTRPCRouter, publicProcedure, roleProcedure } from "~/server/api/trpc";
import { crearInscripcionSchema, pagoSchema, TARJETA_RECHAZO } from "~/lib/esquemas/inscripcion";
import { qrDataUrl } from "~/server/qr";

const ORDEN_TIPOS: TipoAsistente[] = ["PROFESIONAL", "SOCIO", "ESTUDIANTE"];

/** spec-004 · router `inscripcion` (contracts/inscripcion.md). Sin cambiar ni cancelar (clarify P1). */
export const inscripcionRouter = createTRPCRouter({
  /** FR-001: precio vigente hoy para cada tipo (público). */
  presupuesto: publicProcedure.input(z.object({ congresoId: z.string() })).query(async ({ ctx, input }) => {
    const c = await ctx.db.congreso.findUnique({ where: { id: input.congresoId }, select: { limiteTemprana: true, tarifas: true } });
    if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });
    const ahora = ctx.ahora();
    const tipos = ORDEN_TIPOS.flatMap((tipo) => {
      const t = c.tarifas.find((x) => x.tipoAsistente === tipo);
      return t ? [{ tipoAsistente: tipo, importeCent: calcularTarifa(t, c.limiteTemprana, ahora).importeCent }] : [];
    });
    const tarifaAplicada = ahora.getTime() <= c.limiteTemprana.getTime() ? ("TEMPRANA" as const) : ("GENERAL" as const);
    return { tarifaAplicada, limiteTemprana: c.limiteTemprana, tipos };
  }),

  /** FR-002…FR-005, FR-011, FR-012: importe calculado y fijado en el servidor. */
  crear: roleProcedure("ASISTENTE")
    .input(crearInscripcionSchema)
    .mutation(async ({ ctx, input }) => {
      const c = await ctx.db.congreso.findUnique({
        where: { id: input.congresoId },
        select: { id: true, fin: true, limiteTemprana: true, tarifas: { where: { tipoAsistente: input.tipoAsistente } } },
      });
      if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });
      const ahora = ctx.ahora();
      if (congresoFinalizado(c, ahora)) conflicto("El congreso ha finalizado: ya no se admiten inscripciones");
      const tarifa = c.tarifas[0];
      if (!tarifa) throw new TRPCError({ code: "BAD_REQUEST", message: "Este congreso no tiene tarifa para ese tipo de asistente" });
      const { tarifaAplicada, importeCent } = calcularTarifa(tarifa, c.limiteTemprana, ahora);
      try {
        return await ctx.db.inscripcion.create({
          data: { congresoId: c.id, usuarioId: ctx.usuario.id, tipoAsistente: input.tipoAsistente, tarifaAplicada, importeCent, creadaEn: ahora },
          select: { id: true, importeCent: true, tarifaAplicada: true },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") conflicto("Ya tienes una inscripción en este congreso");
        throw e;
      }
    }),

  /** FR-005…FR-009, FR-013: pasarela simulada; bloqueo contra pagos dobles (R3). */
  pagar: roleProcedure("ASISTENTE")
    .input(pagoSchema)
    .mutation(async ({ ctx, input }) => {
      const ultimos4 = input.tarjeta.slice(-4);
      const aprobado = input.tarjeta !== TARJETA_RECHAZO;
      return ctx.db.$transaction(async (tx) => {
        const [ins] = await tx.$queryRaw<{ id: string; usuarioId: string; estado: string; importeCent: number }[]>`
          SELECT id, "usuarioId", estado, "importeCent" FROM "Inscripcion" WHERE id = ${input.inscripcionId} FOR UPDATE`;
        if (!ins || ins.usuarioId !== ctx.usuario.id) throw new TRPCError({ code: "FORBIDDEN", message: "No puedes pagar una inscripción de otra persona" });
        if (ins.estado === "CONFIRMADA") conflicto("Esta inscripción ya está pagada");
        const ahora = ctx.ahora();
        await tx.pago.create({
          data: {
            inscripcionId: ins.id,
            importeCent: ins.importeCent,
            resultado: aprobado ? "APROBADO" : "RECHAZADO",
            referencia: `SIM-${randomBytes(4).toString("hex")}-${ultimos4}`, // nunca el número completo (Constitución VII)
            fecha: ahora,
          },
        });
        if (!aprobado) return { resultado: "RECHAZADO" as const, mensaje: "El pago ha sido rechazado. Prueba con otra tarjeta." };
        await tx.inscripcion.update({ where: { id: ins.id }, data: { estado: "CONFIRMADA", confirmadaEn: ahora, codigoAcreditacion: randomUUID() } });
        return { resultado: "APROBADO" as const, mensaje: "Pago aprobado. Tu inscripción está confirmada." };
      });
    }),

  /** US2-1, US2-5: mis inscripciones; QR solo para las confirmadas (FR-006, FR-009). */
  mias: roleProcedure("ASISTENTE").query(async ({ ctx }) => {
    const lista = await ctx.db.inscripcion.findMany({
      where: { usuarioId: ctx.usuario.id },
      orderBy: { creadaEn: "desc" },
      select: {
        id: true,
        tipoAsistente: true,
        tarifaAplicada: true,
        importeCent: true,
        estado: true,
        creadaEn: true,
        codigoAcreditacion: true,
        congreso: { select: { nombre: true, slug: true, zonaHoraria: true } },
      },
    });
    return Promise.all(
      lista.map(async ({ codigoAcreditacion, ...i }) => {
        const codigo = i.estado === "CONFIRMADA" ? codigoAcreditacion : null;
        return { ...i, codigo, qr: codigo ? await qrDataUrl(codigo) : null };
      }),
    );
  }),
});
