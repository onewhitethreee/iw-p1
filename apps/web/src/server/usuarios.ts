import type { Rol } from "@prisma/client";
import { db } from "~/server/db";

export interface UsuarioActual {
  id: string;
  nombre: string;
  email: string;
  roles: Rol[];
}

/** Carga el usuario y sus roles desde la BD (los roles nunca se fían del token, R2). */
export async function cargarUsuario(id: string): Promise<UsuarioActual | null> {
  const u = await db.usuario.findUnique({
    where: { id },
    select: { id: true, nombre: true, email: true, roles: { select: { rol: true } } },
  });
  if (!u) return null;
  return { id: u.id, nombre: u.nombre, email: u.email, roles: u.roles.map((r) => r.rol) };
}
