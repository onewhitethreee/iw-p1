import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { congresoConPlazo } from "./fixtures";

async function propuesta(congresoId: string, areaId: string, autorId: string, titulo: string, enviadaEn: Date, estado: "ENVIADA" | "EN_EVALUACION" | "ACEPTADA" | "RECHAZADA" = "ENVIADA") {
  return db.propuesta.create({ data: { congresoId, areaId, autorId, titulo, resumen: "r".repeat(120), enviadaEn, estado } });
}

describe("propuesta.mias (spec-001 US2)", () => {
  it("(a)(b) US2-1/US2-2: solo las propias, de la más reciente a la más antigua", async () => {
    const c = await congresoConPlazo();
    const yo = await crearUsuario(["PONENTE"]);
    const otro = await crearUsuario(["PONENTE"]);
    await propuesta(c.id, c.area.id, yo.id, "Antigua", new Date("2027-01-11T10:00:00Z"));
    await propuesta(c.id, c.area.id, yo.id, "Reciente", new Date("2027-01-20T10:00:00Z"), "ACEPTADA");
    await propuesta(c.id, c.area.id, otro.id, "De otro", new Date("2027-01-15T10:00:00Z"));
    const r = await (await crearCaller(yo.id)).propuesta.mias();
    expect(r.map((p) => p.titulo)).toEqual(["Reciente", "Antigua"]);
  });

  it("(c) FR-010 / clarify P3: exactamente los campos permitidos, sin datos de evaluación", async () => {
    const c = await congresoConPlazo();
    const yo = await crearUsuario(["PONENTE"]);
    const ev1 = await crearUsuario(["COMITE"]);
    const ev2 = await crearUsuario(["COMITE"]);
    const p = await propuesta(c.id, c.area.id, yo.id, "Evaluada", new Date(), "ACEPTADA");
    for (const ev of [ev1, ev2]) {
      await db.asignacion.create({ data: { propuestaId: p.id, evaluadorId: ev.id, evaluacion: { create: { puntuacion: 9, comentarios: "Muy buena" } } } });
    }
    const [r] = await (await crearCaller(yo.id)).propuesta.mias();
    expect(Object.keys(r!).sort()).toEqual(["area", "congreso", "enviadaEn", "estado", "id", "resumen", "titulo"]);
    expect(Object.keys(r!.area)).toEqual(["nombre"]);
    expect(Object.keys(r!.congreso).sort()).toEqual(["nombre", "slug", "zonaHoraria"]);
    expect(JSON.stringify(r)).not.toMatch(/puntuacion|comentarios|evaluador|Muy buena/);
  });

  it("(d) filtra por congreso", async () => {
    const c1 = await congresoConPlazo();
    const c2 = await congresoConPlazo();
    const yo = await crearUsuario(["PONENTE"]);
    await propuesta(c1.id, c1.area.id, yo.id, "En C1", new Date());
    await propuesta(c2.id, c2.area.id, yo.id, "En C2", new Date());
    const r = await (await crearCaller(yo.id)).propuesta.mias({ congresoId: c2.id });
    expect(r.map((p) => p.titulo)).toEqual(["En C2"]);
  });

  it("(e) sin rol ponente → FORBIDDEN", async () => {
    const asistente = await crearUsuario(["ASISTENTE"]);
    await expect((await crearCaller(asistente.id)).propuesta.mias()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
