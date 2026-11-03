import bcrypt from "bcryptjs";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, roleProcedure, conflicto } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const registroSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().toLowerCase().email("Introduce un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100),
  // FR-001: al registrarse solo se puede elegir ponente o asistente (FR-003)
  rol: z.enum(["PONENTE", "ASISTENTE"], { message: "Elige ponente o asistente" }),
});

export const authRouter = createTRPCRouter({
  registrar: publicProcedure.input(registroSchema).mutation(async ({ ctx, input }) => {
    const existe = await ctx.db.usuario.findUnique({ where: { email: input.email } });
    if (existe) conflicto("Ya existe una cuenta con ese correo");
    const usuario = await ctx.db.usuario.create({
      data: {
        nombre: input.nombre,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 10),
        roles: { create: { rol: input.rol } },
      },
      select: { id: true, nombre: true, email: true },
    });
    return usuario;
  }),

  yo: protectedProcedure.query(({ ctx }) => ctx.usuario),

  /** Clarify P2 (FR-003a): el propio usuario puede añadirse PONENTE o ASISTENTE; nunca otro rol. */
  anadirRolPropio: protectedProcedure
    .input(z.object({ rol: z.enum(["PONENTE", "ASISTENTE"], { message: "Solo puedes añadirte el rol ponente o asistente" }) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.usuarioRol.upsert({
        where: { usuarioId_rol: { usuarioId: ctx.usuario.id, rol: input.rol } },
        create: { usuarioId: ctx.usuario.id, rol: input.rol },
        update: {},
      });
      return { ok: true };
    }),

  asignarRol: roleProcedure("ORGANIZADOR")
    .input(z.object({ usuarioId: z.string(), rol: z.enum(["ORGANIZADOR", "COMITE", "PONENTE", "ASISTENTE", "ACREDITACION"]) }))
    .mutation(async ({ ctx, input }) => {
      const u = await ctx.db.usuario.findUnique({ where: { id: input.usuarioId } });
      if (!u) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });
      await ctx.db.usuarioRol.upsert({
        where: { usuarioId_rol: { usuarioId: input.usuarioId, rol: input.rol } },
        create: { usuarioId: input.usuarioId, rol: input.rol },
        update: {},
      });
      return { ok: true };
    }),
});
