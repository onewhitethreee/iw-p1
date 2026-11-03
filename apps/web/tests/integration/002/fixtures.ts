import type { EstadoPropuesta } from "@prisma/client";
import { db } from "~/server/db";
import { crearCongreso, crearUsuario } from "../helpers";

let n = 0;

/** Escenario de spec-002: autora reconocible para detectar cualquier fuga de autoría (SC-001). */
export async function escenario(estado: EstadoPropuesta = "ENVIADA") {
  const congreso = await crearCongreso();
  const area = await db.areaTematica.create({ data: { congresoId: congreso.id, nombre: "Área de prueba" } });
  const autora = await db.usuario.create({
    data: { nombre: "Autora Secreta", email: `autora.secreta.${++n}@test.es`, passwordHash: "x", roles: { create: [{ rol: "PONENTE" }] } },
  });
  const propuesta = await db.propuesta.create({
    data: { congresoId: congreso.id, areaId: area.id, autorId: autora.id, titulo: "Propuesta de prueba", resumen: "r".repeat(120), estado },
  });
  const organizador = await crearUsuario(["ORGANIZADOR"]);
  const comite = [await crearUsuario(["COMITE"]), await crearUsuario(["COMITE"]), await crearUsuario(["COMITE"])] as const;
  return { congreso, area, autora, propuesta, organizador, comite };
}

/** Asigna y, opcionalmente, evalúa directamente en BD (preparación de datos). */
export async function asignarDirecto(propuestaId: string, evaluadorId: string, puntuacion?: number) {
  const a = await db.asignacion.create({
    data: {
      propuestaId,
      evaluadorId,
      ...(puntuacion ? { evaluacion: { create: { puntuacion, comentarios: "Comentario de prueba" } } } : {}),
    },
  });
  await db.propuesta.updateMany({ where: { id: propuestaId, estado: "ENVIADA" }, data: { estado: "EN_EVALUACION" } });
  return a;
}
