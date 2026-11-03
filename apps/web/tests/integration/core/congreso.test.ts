import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearCongreso } from "../helpers";

const DIA = 24 * 3600 * 1000;

describe("congreso.listar / porSlug (000-core US2)", () => {
  it("lista los congresos con su fase calculada, sin iniciar sesión", async () => {
    const ahora = new Date();
    const d = (n: number) => new Date(ahora.getTime() + n * DIA);
    await crearCongreso(ahora, { slug: "abierto", inicio: d(30), fin: d(32) });
    await crearCongreso(ahora, { slug: "en-curso", envioAbre: d(-60), envioCierra: d(-30), inicio: d(-1), fin: d(1) });
    await crearCongreso(ahora, { slug: "finalizado", envioAbre: d(-90), envioCierra: d(-60), inicio: d(-10), fin: d(-9) });
    const api = await crearCaller(null, ahora);
    const lista = await api.congreso.listar();
    expect(Object.fromEntries(lista.map((c) => [c.slug, c.fase]))).toEqual({
      abierto: "LLAMADA_ABIERTA",
      "en-curso": "EN_CURSO",
      finalizado: "FINALIZADO",
    });
  });

  it("porSlug devuelve áreas, salas y tarifas", async () => {
    const c = await crearCongreso();
    await db.areaTematica.create({ data: { congresoId: c.id, nombre: "Área 1" } });
    await db.tarifa.create({ data: { congresoId: c.id, tipoAsistente: "ESTUDIANTE", importeTempranoCent: 9000, importeGeneralCent: 12000 } });
    const api = await crearCaller();
    const r = await api.congreso.porSlug({ slug: c.slug });
    expect(r.areas.map((a) => a.nombre)).toEqual(["Área 1"]);
    expect(r.tarifas).toHaveLength(1);
  });

  it("porSlug con un slug inexistente devuelve NOT_FOUND", async () => {
    const api = await crearCaller();
    await expect(api.congreso.porSlug({ slug: "no-existe" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
