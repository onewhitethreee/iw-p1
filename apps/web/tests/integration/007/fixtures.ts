import { db } from "~/server/db";
import { crearUsuario } from "../helpers";

const MIN = 60_000;
/** Primer día del congreso de pruebas: 08:00 UTC = 10:00 en Madrid (horario de verano). */
const BASE = new Date("2027-05-10T08:00:00Z");
export const min = (m: number) => new Date(BASE.getTime() + m * MIN);
/** Fin del congreso: 2 días después de BASE. */
export const FIN = min(2 * 24 * 60);
/** Momento por defecto: un día después del fin (congreso finalizado). */
export const DESPUES = min(3 * 24 * 60);
/** Momento durante el congreso. */
export const DURANTE = min(24 * 60);

let n = 0;

/**
 * Congreso con 5 sesiones de duraciones conocidas (90, 60, 60, 60 y 90 min) y una sexta
 * para asistencias fuera de agenda.
 */
export async function escenario() {
  n++;
  const c = await db.congreso.create({
    data: {
      slug: `cert-${n}-${Date.now()}`,
      nombre: `Congreso certificado ${n}`,
      descripcion: "x",
      sede: "Sede de pruebas",
      zonaHoraria: "Europe/Madrid",
      envioAbre: min(-90 * 24 * 60),
      envioCierra: min(-60 * 24 * 60),
      limiteTemprana: min(-30 * 24 * 60),
      inicio: min(-60),
      fin: FIN,
      estadoPrograma: "PUBLICADO",
      areas: { create: [{ nombre: "A" }] },
      salas: { create: [{ nombre: "Sala", aforo: 100 }] },
    },
    include: { areas: true, salas: true },
  });
  const autor = await db.usuario.create({ data: { nombre: "Autor", email: `cert-au${n}-${Date.now()}@t.es`, passwordHash: "x" } });
  const duraciones = [90, 60, 60, 60, 90, 60];
  const sesiones = [];
  for (const [i, d] of duraciones.entries()) {
    const p = await db.propuesta.create({
      data: { congresoId: c.id, areaId: c.areas[0]!.id, autorId: autor.id, titulo: `Sesión ${i + 1}`, resumen: "r".repeat(120), estado: "ACEPTADA" },
    });
    const ini = i * 120;
    sesiones.push(await db.sesion.create({ data: { congresoId: c.id, propuestaId: p.id, salaId: c.salas[0]!.id, inicio: min(ini), fin: min(ini + d) } }));
  }
  const puerta = await crearUsuario(["ACREDITACION"]);
  return { c, agenda: sesiones.slice(0, 5), fuera: sesiones[5]!, puerta };
}

type Escenario = Awaited<ReturnType<typeof escenario>>;

/**
 * Asistente con inscripción, `enAgenda` primeras sesiones en su agenda y asistencia a las `asistidas` primeras.
 */
export async function asistente(
  e: Escenario,
  { enAgenda = 5, asistidas = 0, estado = "CONFIRMADA" as "CONFIRMADA" | "PENDIENTE_PAGO", roles = ["ASISTENTE"] as Parameters<typeof crearUsuario>[0], nombre = "Lucía Certificada" } = {},
) {
  const u = await crearUsuario(roles, nombre);
  const ins = await db.inscripcion.create({
    data: {
      congresoId: e.c.id,
      usuarioId: u.id,
      tipoAsistente: "PROFESIONAL",
      tarifaAplicada: "GENERAL",
      importeCent: 100,
      estado,
      codigoAcreditacion: estado === "CONFIRMADA" ? `cert-${++n}-${Date.now()}-${Math.random()}` : null,
    },
  });
  for (const s of e.agenda.slice(0, enAgenda)) await db.entradaAgenda.create({ data: { inscripcionId: ins.id, sesionId: s.id } });
  for (const s of e.agenda.slice(0, asistidas)) {
    await db.asistencia.create({ data: { inscripcionId: ins.id, sesionId: s.id, registradaPorId: e.puerta.id, registradaEn: s.inicio } });
  }
  return { u, ins };
}
