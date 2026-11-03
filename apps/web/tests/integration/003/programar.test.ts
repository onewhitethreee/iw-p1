import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { ANTES, DIA1, escenario, local } from "./fixtures";

const h = (dia: string, horaInicio: string, horaFin: string) => ({ dia, horaInicio, horaFin });

describe("programa.programar (spec-003 US1)", () => {
  it("(a) US1-1: crea la sesión con horas convertidas desde la zona del congreso y sale de pendientes", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    const { id } = await api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    const s = await db.sesion.findUniqueOrThrow({ where: { id } });
    expect(s.inicio.toISOString()).toBe("2027-04-20T08:00:00.000Z");
    expect(s.fin.toISOString()).toBe("2027-04-20T08:30:00.000Z");
    const pend = await api.programa.pendientes({ congresoId: e.congreso.id });
    expect(pend.map((p) => p.titulo)).not.toContain("A1 de Ana");
    expect(pend.map((p) => p.titulo)).toContain("A2 de Ana");
  });

  it("(b) US1-2: solape de ponente → CONFLICT con ponente, título y horas locales", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    await api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    await expect(api.programa.programar({ propuestaId: e.a2.id, salaId: e.sala("Media").id, ...h(DIA1, "10:15", "10:45") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: `${e.autorA.nombre} ya tiene la sesión «A1 de Ana» de 10:00 a 10:30`,
    });
    expect(await db.sesion.count({ where: { congresoId: e.congreso.id } })).toBe(1);
  });

  it("(c) US1-3: solape de sala → CONFLICT con sala, título y horas", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    await api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    await expect(api.programa.programar({ propuestaId: e.b1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sala Grande está ocupada por «A1 de Ana» de 10:00 a 10:30",
    });
  });

  it("(d) US1-4: sesiones contiguas se aceptan (mismo ponente y misma sala)", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    await api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    await api.programa.programar({ propuestaId: e.a2.id, salaId: e.sala("Media").id, ...h(DIA1, "10:30", "11:00") });
    await api.programa.programar({ propuestaId: e.b1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:30", "11:00") });
    expect(await db.sesion.count({ where: { congresoId: e.congreso.id } })).toBe(3);
  });

  it("(e) US1-5: solo aceptadas y una sola vez", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    await expect(api.programa.programar({ propuestaId: e.enEval.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Solo se pueden programar ponencias aceptadas",
    });
    await api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    await expect(api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Media").id, ...h(DIA1, "12:00", "12:30") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Esta ponencia ya está programada",
    });
  });

  it("(f) US1-6: horario inválido, fuera del congreso, cruzando medianoche o sala ajena → BAD_REQUEST", async () => {
    const e = await escenario();
    const otro = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    const base = { propuestaId: e.a1.id, salaId: e.sala("Grande").id };
    await expect(api.programa.programar({ ...base, ...h(DIA1, "11:00", "10:00") })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "La hora de fin debe ser posterior a la de inicio" });
    await expect(api.programa.programar({ ...base, ...h(DIA1, "23:30", "00:30") })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "La hora de fin debe ser posterior a la de inicio" });
    await expect(api.programa.programar({ ...base, ...h(DIA1, "07:00", "07:30") })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "La sesión debe estar dentro de las fechas del congreso" });
    await expect(api.programa.programar({ ...base, ...h("2027-05-01", "10:00", "10:30") })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(api.programa.programar({ ...base, salaId: otro.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "La sala no pertenece a este congreso" });
    expect(await db.sesion.count({ where: { congresoId: e.congreso.id } })).toBe(0);
  });

  it("(g) US1-7: quien no es organizador no puede programar", async () => {
    const e = await escenario();
    const ponente = await crearUsuario(["PONENTE"]);
    await expect((await crearCaller(ponente.id, ANTES)).programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("(h) FR-012: con el congreso finalizado no se programa", async () => {
    const e = await escenario();
    const despues = new Date(e.congreso.fin.getTime() + 1000);
    await expect((await crearCaller(e.organizador.id, despues)).programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "El congreso ha finalizado: el programa ya no se puede modificar",
    });
  });

  it("(i) SC-001: dos programaciones simultáneas en la misma sala y hora → solo una se crea", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    const r = await Promise.allSettled([
      api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") }),
      api.programa.programar({ propuestaId: e.b1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") }),
    ]);
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect(await db.sesion.count({ where: { congresoId: e.congreso.id } })).toBe(1);
    void local;
  });
});
