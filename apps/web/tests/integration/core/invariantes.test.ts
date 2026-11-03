import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearCongreso, crearUsuario } from "../helpers";

const DIA = 24 * 3600 * 1000;

/** Converge F2 / T043: las invariantes de data-model.md las garantiza también la BD. */
describe("restricciones CHECK de la base de datos (data-model.md)", () => {
  it("rechaza un congreso que termina antes de empezar", async () => {
    const ahora = new Date();
    await expect(crearCongreso(ahora, { fin: new Date(ahora.getTime() - DIA), inicio: ahora })).rejects.toThrow(/Congreso_fechas_check/);
  });

  it("rechaza un cierre de envío posterior al inicio y una fecha temprana posterior al inicio", async () => {
    const r = new Date();
    const d = (n: number) => new Date(r.getTime() + n * DIA);
    await expect(crearCongreso(r, { envioCierra: d(40), inicio: d(30), fin: d(32) })).rejects.toThrow(/Congreso_fechas_check/);
    await expect(crearCongreso(r, { limiteTemprana: d(31), inicio: d(30), fin: d(32) })).rejects.toThrow(/Congreso_fechas_check/);
  });

  it("rechaza una sala con aforo 0", async () => {
    const c = await crearCongreso();
    await expect(db.sala.create({ data: { congresoId: c.id, nombre: "Sala 0", aforo: 0 } })).rejects.toThrow(/Sala_aforo_check/);
  });

  it("rechaza tarifas negativas o con precio general menor que el temprano", async () => {
    const c = await crearCongreso();
    const t = { congresoId: c.id, tipoAsistente: "ESTUDIANTE" as const };
    await expect(db.tarifa.create({ data: { ...t, importeTempranoCent: -1, importeGeneralCent: 100 } })).rejects.toThrow(/Tarifa_importes_check/);
    await expect(db.tarifa.create({ data: { ...t, importeTempranoCent: 200, importeGeneralCent: 100 } })).rejects.toThrow(/Tarifa_importes_check/);
  });

  it("rechaza puntuaciones fuera de 1–10 y acepta los extremos", async () => {
    const c = await crearCongreso();
    const area = await db.areaTematica.create({ data: { congresoId: c.id, nombre: "A" } });
    const autor = await crearUsuario(["PONENTE"]);
    const ev = await crearUsuario(["COMITE"]);
    const p = await db.propuesta.create({ data: { congresoId: c.id, areaId: area.id, autorId: autor.id, titulo: "Título", resumen: "r" } });
    const a = await db.asignacion.create({ data: { propuestaId: p.id, evaluadorId: ev.id } });
    await expect(db.evaluacion.create({ data: { asignacionId: a.id, puntuacion: 11, comentarios: "x" } })).rejects.toThrow(/Evaluacion_puntuacion_check/);
    await expect(db.evaluacion.create({ data: { asignacionId: a.id, puntuacion: 0, comentarios: "x" } })).rejects.toThrow(/Evaluacion_puntuacion_check/);
    await expect(db.evaluacion.create({ data: { asignacionId: a.id, puntuacion: 10, comentarios: "x" } })).resolves.toBeTruthy();
  });

  it("los datos válidos siguen aceptándose (congreso de prueba por defecto)", async () => {
    await expect(crearCongreso()).resolves.toBeTruthy();
    void crearCaller;
  });
});
