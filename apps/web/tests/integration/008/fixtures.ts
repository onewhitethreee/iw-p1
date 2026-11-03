import type { EstadoInscripcion, TarifaAplicada, TipoAsistente } from "@prisma/client";
import { db } from "~/server/db";
import { crearUsuario } from "../helpers";

const MIN = 60_000;
/** 10:00 en Madrid (horario de verano) del primer día del congreso. */
const BASE = new Date("2027-06-14T08:00:00Z");
export const min = (m: number) => new Date(BASE.getTime() + m * MIN);
/** Momento por defecto: el primer día a las 10:30. */
export const AHORA = min(30);
export const FIN_CONGRESO = min(2 * 24 * 60);

let n = 0;

/** Congreso con salas de aforo 2, 10 y 200 y tres sesiones: «En curso» (Pequeña), «Tarde» (Mediana) y «Mañana pasada» (terminada). */
export async function escenario() {
  n++;
  const c = await db.congreso.create({
    data: {
      slug: `panel-${n}-${Date.now()}`,
      nombre: `Congreso panel ${n}`,
      descripcion: "x",
      sede: "x",
      zonaHoraria: "Europe/Madrid",
      envioAbre: min(-90 * 24 * 60),
      envioCierra: min(-60 * 24 * 60),
      limiteTemprana: min(-30 * 24 * 60),
      inicio: min(-120),
      fin: FIN_CONGRESO,
      estadoPrograma: "PUBLICADO",
      areas: { create: [{ nombre: "A" }] },
      salas: { create: [{ nombre: "Pequeña", aforo: 2 }, { nombre: "Mediana", aforo: 10 }, { nombre: "Grande", aforo: 200 }] },
    },
    include: { areas: true, salas: true },
  });
  const sala = (nombre: string) => c.salas.find((s) => s.nombre === nombre)!;
  const autor = await db.usuario.create({ data: { nombre: "Autor", email: `pan-au${n}-${Date.now()}@t.es`, passwordHash: "x" } });
  const sesion = async (titulo: string, salaNombre: string, ini: number, fin: number) => {
    const p = await db.propuesta.create({
      data: { congresoId: c.id, areaId: c.areas[0]!.id, autorId: autor.id, titulo, resumen: "r".repeat(120), estado: "ACEPTADA" },
    });
    return db.sesion.create({ data: { congresoId: c.id, propuestaId: p.id, salaId: sala(salaNombre).id, inicio: min(ini), fin: min(fin) } });
  };
  const s = {
    pasada: await sesion("Mañana pasada", "Grande", -120, -60),
    enCurso: await sesion("En curso", "Pequeña", 0, 60),
    tarde: await sesion("Tarde", "Mediana", 300, 360),
  };
  const puerta = await crearUsuario(["ACREDITACION"]);
  const org = await crearUsuario(["ORGANIZADOR"]);
  return { c, s, sala, puerta, org, sesion };
}

/** Inscripción con pagos (importes en céntimos). Devuelve la inscripción. */
export async function inscribir(
  congresoId: string,
  tipo: TipoAsistente,
  tarifa: TarifaAplicada,
  estado: EstadoInscripcion,
  pagos: { cent: number; aprobado: boolean }[] = [],
) {
  const u = await db.usuario.create({ data: { nombre: "Asistente", email: `pan-as${++n}-${Date.now()}@t.es`, passwordHash: "x" } });
  return db.inscripcion.create({
    data: {
      congresoId,
      usuarioId: u.id,
      tipoAsistente: tipo,
      tarifaAplicada: tarifa,
      importeCent: pagos[0]?.cent ?? 10000,
      estado,
      codigoAcreditacion: estado === "CONFIRMADA" ? `pan-${n}-${Date.now()}-${Math.random()}` : null,
      pagos: { create: pagos.map((p, i) => ({ importeCent: p.cent, resultado: p.aprobado ? "APROBADO" : "RECHAZADO", referencia: `ref-${n}-${i}` })) },
    },
  });
}

export const reservar = (inscripcionId: string, sesionId: string) => db.entradaAgenda.create({ data: { inscripcionId, sesionId } });
export const asistir = (inscripcionId: string, sesionId: string, registradaPorId: string) =>
  db.asistencia.create({ data: { inscripcionId, sesionId, registradaPorId } });
