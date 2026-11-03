import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { asignarDirecto, escenario } from "./fixtures";

const COMENT = "Propuesta sólida y bien documentada.";

describe("evaluacion · evaluar (spec-002 US1)", () => {
  it("(a) US1-1: misAsignaciones devuelve solo las del evaluador y si están evaluadas", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[0].id, 7);
    const otra = await db.propuesta.create({ data: { congresoId: e.congreso.id, areaId: e.area.id, autorId: e.autora.id, titulo: "Otra", resumen: "r".repeat(120) } });
    await asignarDirecto(otra.id, e.comite[1].id);
    const r = await (await crearCaller(e.comite[0].id)).evaluacion.misAsignaciones({});
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ evaluada: true, puntuacion: 7, propuesta: { titulo: "Propuesta de prueba" } });
  });

  it("(b) US1-2: evaluar guarda puntuación y comentarios", async () => {
    const e = await escenario();
    const a = await asignarDirecto(e.propuesta.id, e.comite[0].id);
    await (await crearCaller(e.comite[0].id)).evaluacion.evaluar({ asignacionId: a.id, puntuacion: 8, comentarios: COMENT });
    expect(await db.evaluacion.findUnique({ where: { asignacionId: a.id } })).toMatchObject({ puntuacion: 8, comentarios: COMENT });
  });

  it("(c) US1-3: puntuación fuera de 1–10, decimal o comentarios cortos → BAD_REQUEST sin guardar", async () => {
    const e = await escenario();
    const a = await asignarDirecto(e.propuesta.id, e.comite[0].id);
    const api = await crearCaller(e.comite[0].id);
    for (const puntuacion of [0, 11, 7.5]) {
      await expect(api.evaluacion.evaluar({ asignacionId: a.id, puntuacion, comentarios: COMENT })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    await expect(api.evaluacion.evaluar({ asignacionId: a.id, puntuacion: 5, comentarios: "123456789" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(await db.evaluacion.count()).toBe(0);
  });

  it("(d) US1-4: asignación ajena o inexistente → FORBIDDEN", async () => {
    const e = await escenario();
    const a = await asignarDirecto(e.propuesta.id, e.comite[0].id);
    const intruso = await crearCaller(e.comite[1].id);
    const msg = { code: "FORBIDDEN", message: "No tienes asignada esta propuesta" };
    await expect(intruso.evaluacion.detalle({ asignacionId: a.id })).rejects.toMatchObject(msg);
    await expect(intruso.evaluacion.evaluar({ asignacionId: a.id, puntuacion: 5, comentarios: COMENT })).rejects.toMatchObject(msg);
    await expect(intruso.evaluacion.detalle({ asignacionId: "no-existe" })).rejects.toMatchObject(msg);
  });

  it("(e) US1-5: reevaluar sin decidir actualiza la misma evaluación", async () => {
    const e = await escenario();
    const a = await asignarDirecto(e.propuesta.id, e.comite[0].id);
    const api = await crearCaller(e.comite[0].id);
    await api.evaluacion.evaluar({ asignacionId: a.id, puntuacion: 4, comentarios: COMENT });
    await api.evaluacion.evaluar({ asignacionId: a.id, puntuacion: 9, comentarios: "He cambiado de opinión tras releerla." });
    expect(await db.evaluacion.count()).toBe(1);
    expect((await db.evaluacion.findUniqueOrThrow({ where: { asignacionId: a.id } })).puntuacion).toBe(9);
  });

  it("(f) US1-6: propuesta decidida → CONFLICT sin cambios", async () => {
    for (const estado of ["ACEPTADA", "RECHAZADA"] as const) {
      const e = await escenario();
      const a = await asignarDirecto(e.propuesta.id, e.comite[0].id, 6);
      await db.propuesta.update({ where: { id: e.propuesta.id }, data: { estado, decididaEn: new Date() } });
      await expect((await crearCaller(e.comite[0].id)).evaluacion.evaluar({ asignacionId: a.id, puntuacion: 10, comentarios: COMENT })).rejects.toMatchObject({
        code: "CONFLICT",
        message: "La propuesta ya está decidida",
      });
      expect((await db.evaluacion.findUniqueOrThrow({ where: { asignacionId: a.id } })).puntuacion).toBe(6);
    }
  });

  it("(g) sin rol COMITE → FORBIDDEN", async () => {
    const asistente = await crearUsuario(["ASISTENTE"]);
    await expect((await crearCaller(asistente.id)).evaluacion.misAsignaciones({})).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("(h) un evaluador no recibe la puntuación ni los comentarios de otros", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[1].id, 2);
    const a = await asignarDirecto(e.propuesta.id, e.comite[0].id);
    const api = await crearCaller(e.comite[0].id);
    const texto = JSON.stringify([await api.evaluacion.detalle({ asignacionId: a.id }), await api.evaluacion.misAsignaciones({})]);
    expect(texto).not.toContain("Comentario de prueba");
    expect((await api.evaluacion.detalle({ asignacionId: a.id })).evaluacion).toBeNull();
  });
});
