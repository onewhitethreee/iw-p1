import "server-only";
import { cache } from "react";
import { auth } from "~/server/auth";
import { cargarUsuario, type UsuarioActual } from "~/server/usuarios";

export type { UsuarioActual };

/** Usuario de la sesión con sus roles leídos de la BD en cada petición (R2). */
export const getUsuarioActual = cache(async (): Promise<UsuarioActual | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return cargarUsuario(id);
});
