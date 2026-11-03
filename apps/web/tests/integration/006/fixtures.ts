import { db } from "~/server/db";
import { crearUsuario } from "../helpers";

const MIN = 60_000;
/** Inicio de la sesión principal de las pruebas (10:00 en Madrid, horario de verano). */
export const INICIO = new Date("2027-04-20T08:00:00Z");
export const min = (m: number) => new Date(INICIO.getTime() + m * MIN);
/** Momento «actual» por defecto: 10 min después del inicio (sesión abierta). */
export const AHORA = min(10);

let n = 0;

/** Congreso con una sala de aforo 1, otra de aforo 2 y otra de aforo 100, con una sesión en cada una. */
export async function escenario() {
  n++;
  const c = await db.congreso.create({
    data: {
      slug: `acr-${n}-${Date.now()}`,
      nombre: `Congreso acreditación ${n}`,
      descripcion: "x",
      sede: "x",
      zonaHoraria: "Europe/Madrid",
      envioAbre: min(-90 * 24 * 60),
      envioCierra: min(-60 * 24 * 60),
      limiteTemprana: min(-30 * 24 * 60),
      inicio: min(-60),
      fin: min(2 * 24 * 60),
      estadoPrograma: "PUBLICADO",
      areas: { create: [{ nombre: "A" }] },
      salas: { create: [{ nombre: "Pequeña", aforo: 1 }, { nombre: "Doble", aforo: 2 }, { nombre: "Grande", aforo: 100 }] },
    },
    include: { areas: true, salas: true },
  });
  const autor = await db.usuario.create({ data: { nombre: "Autor", email: `acr-au${n}-${Date.now()}@t.es`, passwordHash: "x" } });
  const sesion = async (titulo: string, sala: string, ini = 0, fin = 60) => {
    const p = await db.propuesta.create({
      data: { congresoId: c.id, areaId: c.areas[0]!.id, autorId: autor.id, titulo, resumen: "r".repeat(120), estado: "ACEPTADA" },
    });
    return db.sesion.create({
      data: { congresoId: c.id, propuestaId: p.id, salaId: c.salas.find((s) => s.nombre === sala)!.id, inicio: min(ini), fin: min(fin) },
    });
  };
  const s = {
    pequena: await sesion("En sala pequeña", "Pequeña"),
    doble: await sesion("En sala doble", "Doble"),
    grande: await sesion("En sala grande", "Grande"),
  };
  const puerta = await crearUsuario(["ACREDITACION"], "Personal de puerta");
  return { c, s, puerta };
}

/** Asistente inscrito (confirmado por defecto) con su código de acreditación. */
export async function asistente(congresoId: string, estado: "CONFIRMADA" | "PENDIENTE_PAGO" = "CONFIRMADA", nombre?: string) {
  const u = await crearUsuario(["ASISTENTE"], nombre);
  const ins = await db.inscripcion.create({
    data: {
      congresoId,
      usuarioId: u.id,
      tipoAsistente: "PROFESIONAL",
      tarifaAplicada: "GENERAL",
      importeCent: 100,
      estado,
      codigoAcreditacion: `acr-${++n}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      confirmadaEn: estado === "CONFIRMADA" ? new Date() : null,
    },
  });
  return { u, ins, codigo: ins.codigoAcreditacion! };
}
