import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { faseCongreso } from "@congresalia/domain";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const camposPublicos = {
  id: true,
  slug: true,
  nombre: true,
  descripcion: true,
  sede: true,
  zonaHoraria: true,
  inicio: true,
  fin: true,
  envioAbre: true,
  envioCierra: true,
  limiteTemprana: true,
  estadoPrograma: true,
} as const;

export const congresoRouter = createTRPCRouter({
  listar: publicProcedure.query(async ({ ctx }) => {
    const ahora = ctx.ahora();
    const congresos = await ctx.db.congreso.findMany({ select: camposPublicos, orderBy: { inicio: "asc" } });
    return congresos.map((c) => ({ ...c, fase: faseCongreso(c, ahora) }));
  }),

  porSlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const c = await ctx.db.congreso.findUnique({
      where: { slug: input.slug },
      select: {
        ...camposPublicos,
        areas: { select: { id: true, nombre: true }, orderBy: { nombre: "asc" } },
        tarifas: {
          select: { tipoAsistente: true, importeTempranoCent: true, importeGeneralCent: true },
          orderBy: { tipoAsistente: "asc" },
        },
        salas: { select: { id: true, nombre: true, aforo: true }, orderBy: { nombre: "asc" } },
      },
    });
    if (!c) throw new TRPCError({ code: "NOT_FOUND", message: "Congreso no encontrado" });
    return { ...c, fase: faseCongreso(c, ctx.ahora()) };
  }),
});
