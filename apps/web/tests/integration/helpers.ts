import type { Rol } from "@prisma/client";
import { createCaller } from "~/server/api/root";
import { crearContexto } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cargarUsuario } from "~/server/usuarios";

let n = 0;

/** Crea un usuario con los roles indicados (sin contraseña utilizable). */
export async function crearUsuario(roles: Rol[], nombre = `Usuario ${++n}`) {
  return db.usuario.create({
    data: {
      nombre,
      email: `u${n}-${Date.now()}@test.es`,
      passwordHash: "x",
      roles: { create: roles.map((rol) => ({ rol })) },
    },
  });
}

/**
 * Caller de tRPC que actúa como el usuario indicado (o anónimo), saltándose la interfaz:
 * demuestra que las reglas se aplican en el servidor (SC-001).
 */
export async function crearCaller(usuarioId?: string | null, ahora?: Date) {
  const usuario = usuarioId ? await cargarUsuario(usuarioId) : null;
  return createCaller(crearContexto(usuario, ahora ? () => ahora : undefined));
}

const DIA = 24 * 3600 * 1000;

/** Congreso de prueba con fechas relativas a `ref`. */
export async function crearCongreso(ref = new Date(), datos: Partial<Parameters<typeof db.congreso.create>[0]["data"]> = {}) {
  const d = (dias: number) => new Date(ref.getTime() + dias * DIA);
  return db.congreso.create({
    data: {
      slug: `congreso-${++n}`,
      nombre: `Congreso ${n}`,
      descripcion: "Congreso de prueba",
      sede: "Sede de prueba",
      envioAbre: d(-5),
      envioCierra: d(5),
      limiteTemprana: d(10),
      inicio: d(30),
      fin: d(32),
      ...datos,
    },
  });
}
