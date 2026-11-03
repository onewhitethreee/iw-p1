import { initTRPC, TRPCError } from "@trpc/server";
import type { Rol } from "@prisma/client";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "~/server/db";
import type { UsuarioActual } from "~/server/usuarios";

/**
 * Contexto de cada petición. `usuario` se carga desde la BD (no desde el token),
 * así un rol retirado deja de valer en la siguiente llamada (spec 000-core, Edge Cases).
 */
export interface Contexto {
  db: typeof db;
  usuario: UsuarioActual | null;
  ahora: () => Date;
}

export function crearContexto(usuario: UsuarioActual | null, ahora: () => Date = () => new Date()): Contexto {
  return { db, usuario, ahora };
}

const t = initTRPC.context<Contexto>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zod = error.cause instanceof ZodError ? error.cause.flatten() : null;
    return {
      ...shape,
      message: zod ? "Hay datos no válidos en el formulario" : shape.message,
      data: { ...shape.data, zodError: zod },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.usuario) throw new TRPCError({ code: "UNAUTHORIZED", message: "Tienes que iniciar sesión" });
  return next({ ctx: { ...ctx, usuario: ctx.usuario } });
});

/** Procedimiento que exige al menos uno de los roles indicados (Constitución IV). */
export function roleProcedure(...roles: Rol[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!ctx.usuario.roles.some((r) => roles.includes(r))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permiso para realizar esta acción" });
    }
    return next({ ctx });
  });
}

/** Atajo para errores de reglas de negocio. */
export function conflicto(message: string): never {
  throw new TRPCError({ code: "CONFLICT", message });
}
