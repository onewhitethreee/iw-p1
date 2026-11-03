import { finDeDia, inicioDeDia, inicioDelDiaSiguiente, instanteLocal } from "@congresalia/domain";
import { db } from "~/server/db";
import { crearUsuario } from "../helpers";

export const ZONA = "Europe/Madrid";
/** Congreso del 20 al 22 de abril de 2027 (Madrid, horario de verano UTC+2). */
export const DIA1 = "2027-04-20";
export const DIA2 = "2027-04-21";
export const local = (dia: string, hora: string) => instanteLocal(`${dia}T${hora}`, ZONA);
/** Un instante anterior al congreso (para programar con normalidad). */
export const ANTES = new Date("2027-03-01T10:00:00Z");

let n = 0;

export async function escenario() {
  n++;
  const congreso = await db.congreso.create({
    data: {
      slug: `prog-${n}-${Date.now()}`,
      nombre: `Congreso programa ${n}`,
      descripcion: "Prueba",
      sede: "Sede",
      zonaHoraria: ZONA,
      envioAbre: inicioDeDia("2026-12-01", ZONA),
      envioCierra: inicioDelDiaSiguiente("2027-01-31", ZONA),
      limiteTemprana: finDeDia("2027-03-15", ZONA),
      inicio: local(DIA1, "08:00"),
      fin: local("2027-04-22", "20:00"),
      areas: { create: [{ nombre: "Área" }] },
      salas: { create: [{ nombre: "Grande", aforo: 100 }, { nombre: "Media", aforo: 50 }, { nombre: "Pequeña", aforo: 1 }] },
    },
    include: { areas: true, salas: true },
  });
  const sala = (nombre: string) => congreso.salas.find((s) => s.nombre === nombre)!;
  const autorA = await db.usuario.create({ data: { nombre: `Ana Autora ${n}`, email: `ana${n}-${Date.now()}@test.es`, passwordHash: "x" } });
  const autorB = await db.usuario.create({ data: { nombre: `Benito Autor ${n}`, email: `ben${n}-${Date.now()}@test.es`, passwordHash: "x" } });
  const propuesta = (autorId: string, titulo: string, estado: "ACEPTADA" | "EN_EVALUACION" = "ACEPTADA") =>
    db.propuesta.create({ data: { congresoId: congreso.id, areaId: congreso.areas[0]!.id, autorId, titulo, resumen: "r".repeat(120), estado } });
  const a1 = await propuesta(autorA.id, "A1 de Ana");
  const a2 = await propuesta(autorA.id, "A2 de Ana");
  const b1 = await propuesta(autorB.id, "B1 de Benito");
  const b2 = await propuesta(autorB.id, "B2 de Benito");
  const enEval = await propuesta(autorB.id, "En evaluación", "EN_EVALUACION");
  const organizador = await crearUsuario(["ORGANIZADOR"]);
  return { congreso, sala, autorA, autorB, a1, a2, b1, b2, enEval, organizador };
}

/** Inscripción confirmada mínima para crear reservas/asistencias en pruebas. */
export async function inscripcion(congresoId: string) {
  const u = await db.usuario.create({ data: { nombre: "Asistente", email: `as${++n}-${Date.now()}@test.es`, passwordHash: "x" } });
  return db.inscripcion.create({
    data: { congresoId, usuarioId: u.id, tipoAsistente: "PROFESIONAL", tarifaAplicada: "GENERAL", importeCent: 1000, estado: "CONFIRMADA", codigoAcreditacion: `c-${n}-${Date.now()}` },
  });
}
