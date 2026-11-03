import { finDeDia, inicioDeDia, inicioDelDiaSiguiente, instanteLocal } from "@congresalia/domain";
import { db } from "~/server/db";
import { crearUsuario } from "../helpers";

export const ZONA = "Europe/Madrid";
export const DIA = "2027-04-20";
export const local = (hora: string) => instanteLocal(`${DIA}T${hora}`, ZONA);
/** Momento «actual» de las pruebas: 10:30 del primer día (la sesión de 10:00 ya empezó). */
export const AHORA = local("10:30");

let n = 0;
export async function escenario(publicado = true) {
  n++;
  const c = await db.congreso.create({
    data: {
      slug: `ag-${n}-${Date.now()}`,
      nombre: `Congreso agenda ${n}`,
      descripcion: "x",
      sede: "x",
      zonaHoraria: ZONA,
      envioAbre: inicioDeDia("2026-12-01", ZONA),
      envioCierra: inicioDelDiaSiguiente("2027-01-31", ZONA),
      limiteTemprana: finDeDia("2027-03-01", ZONA),
      inicio: local("08:00"),
      fin: finDeDia("2027-04-22", ZONA),
      estadoPrograma: publicado ? "PUBLICADO" : "BORRADOR",
      areas: { create: [{ nombre: "A" }] },
      salas: { create: [{ nombre: "Grande", aforo: 100 }, { nombre: "Pequeña", aforo: 1 }] },
    },
    include: { areas: true, salas: true },
  });
  const sala = (nombre: string) => c.salas.find((s) => s.nombre === nombre)!.id;
  const autor = await db.usuario.create({ data: { nombre: "Autor", email: `au${n}-${Date.now()}@t.es`, passwordHash: "x" } });
  const sesion = async (titulo: string, salaNombre: string, ini: string, fin: string) => {
    const p = await db.propuesta.create({ data: { congresoId: c.id, areaId: c.areas[0]!.id, autorId: autor.id, titulo, resumen: "r".repeat(120), estado: "ACEPTADA" } });
    return db.sesion.create({ data: { congresoId: c.id, propuestaId: p.id, salaId: sala(salaNombre), inicio: local(ini), fin: local(fin) } });
  };
  const s = {
    empezada: await sesion("Empezada", "Grande", "10:00", "11:00"),
    a: await sesion("Sesión A", "Grande", "12:00", "13:00"),
    solapaA: await sesion("Solapa con A", "Grande", "12:30", "13:30"),
    contigua: await sesion("Contigua", "Grande", "13:00", "14:00"),
    pequena: await sesion("En sala pequeña", "Pequeña", "15:00", "16:00"),
  };
  return { c, s };
}

export async function asistente(congresoId: string, estado: "CONFIRMADA" | "PENDIENTE_PAGO" = "CONFIRMADA") {
  const u = await crearUsuario(["ASISTENTE"]);
  const ins = await db.inscripcion.create({
    data: {
      congresoId,
      usuarioId: u.id,
      tipoAsistente: "PROFESIONAL",
      tarifaAplicada: "GENERAL",
      importeCent: 100,
      estado,
      codigoAcreditacion: estado === "CONFIRMADA" ? `c-${++n}-${Date.now()}-${Math.random()}` : null,
    },
  });
  return { u, ins };
}
