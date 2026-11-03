import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { ANTES, DIA1, DIA2, escenario, inscripcion, local } from "./fixtures";

const h = (dia: string, horaInicio: string, horaFin: string) => ({ dia, horaInicio, horaFin });

async function preparado() {
  const e = await escenario();
  const api = await crearCaller(e.organizador.id, ANTES);
  const s1 = await api.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
  const s2 = await api.programa.programar({ propuestaId: e.b1.id, salaId: e.sala("Media").id, ...h(DIA1, "11:00", "11:30") });
  const s3 = await api.programa.programar({ propuestaId: e.a2.id, salaId: e.sala("Media").id, ...h(DIA1, "12:00", "12:30") });
  return { e, api, s1, s2, s3 };
}

describe("programa.mover / quitar (spec-003 US2)", () => {
  it("(a) US2-1: mover a sala u horario libre", async () => {
    const { e, api, s1 } = await preparado();
    await api.programa.mover({ sesionId: s1.id, salaId: e.sala("Media").id, ...h(DIA2, "09:00", "09:45") });
    const s = await db.sesion.findUniqueOrThrow({ where: { id: s1.id } });
    expect(s.salaId).toBe(e.sala("Media").id);
    expect(s.inicio.getTime()).toBe(local(DIA2, "09:00").getTime());
  });

  it("(b) US2-2: un movimiento con solape se rechaza y la sesión no cambia", async () => {
    const { e, api, s1, s3 } = await preparado();
    // mismo ponente (Ana): mover A1 a la hora de A2
    await expect(api.programa.mover({ sesionId: s1.id, ...h(DIA1, "12:15", "12:45") })).rejects.toMatchObject({ code: "CONFLICT", message: expect.stringContaining("ya tiene la sesión «A2 de Ana»") });
    // misma sala: mover A2 a Grande a las 10:00
    await expect(api.programa.mover({ sesionId: s3.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: expect.stringContaining("ya tiene la sesión «A1 de Ana»"),
    });
    const s = await db.sesion.findUniqueOrThrow({ where: { id: s1.id } });
    expect(s.salaId).toBe(e.sala("Grande").id);
    expect(s.inicio.getTime()).toBe(local(DIA1, "10:00").getTime());
  });

  it("(b2) US2-2: solape de sala con otro ponente", async () => {
    const { e, api, s2 } = await preparado();
    await expect(api.programa.mover({ sesionId: s2.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:15", "10:45") })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sala Grande está ocupada por «A1 de Ana» de 10:00 a 10:30",
    });
  });

  it("(c) US2-3: sala con aforo menor que las reservas → CONFLICT", async () => {
    const { e, api, s1 } = await preparado();
    for (let i = 0; i < 2; i++) {
      const insc = await inscripcion(e.congreso.id);
      await db.entradaAgenda.create({ data: { inscripcionId: insc.id, sesionId: s1.id } });
    }
    await expect(api.programa.mover({ sesionId: s1.id, salaId: e.sala("Pequeña").id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sala Pequeña tiene aforo 1 y la sesión tiene 2 reservas",
    });
  });

  it("(d) US2-4: quitar con reservas o asistencias → CONFLICT; sin ellas se quita y vuelve a pendientes", async () => {
    const { e, api, s1, s2 } = await preparado();
    const insc = await inscripcion(e.congreso.id);
    await db.asistencia.create({ data: { inscripcionId: insc.id, sesionId: s1.id, registradaPorId: e.organizador.id } });
    await expect(api.programa.quitar({ sesionId: s1.id })).rejects.toMatchObject({ code: "CONFLICT", message: "No se puede quitar: la sesión tiene 0 reservas y 1 asistencias" });
    await api.programa.quitar({ sesionId: s2.id });
    expect(await db.sesion.findUnique({ where: { id: s2.id } })).toBeNull();
    expect((await api.programa.pendientes({ congresoId: e.congreso.id })).map((p) => p.titulo)).toContain("B1 de Benito");
  });

  it("(e) US2-5 / FR-013: sesión empezada → solo cambio de sala", async () => {
    const { e, s1 } = await preparado();
    const durante = local(DIA1, "10:10");
    const api = await crearCaller(e.organizador.id, durante);
    const msg = { code: "CONFLICT", message: "La sesión ya ha empezado: solo se puede cambiar de sala" };
    await expect(api.programa.mover({ sesionId: s1.id, ...h(DIA1, "10:00", "10:45") })).rejects.toMatchObject(msg);
    await expect(api.programa.quitar({ sesionId: s1.id })).rejects.toMatchObject(msg);
    await api.programa.mover({ sesionId: s1.id, salaId: e.sala("Media").id });
    expect((await db.sesion.findUniqueOrThrow({ where: { id: s1.id } })).salaId).toBe(e.sala("Media").id);
  });

  it("(f) US2-6 / FR-012: congreso finalizado → mover y quitar rechazados", async () => {
    const { e, s2 } = await preparado();
    const api = await crearCaller(e.organizador.id, new Date(e.congreso.fin.getTime() + 1000));
    const msg = { code: "CONFLICT", message: "El congreso ha finalizado: el programa ya no se puede modificar" };
    await expect(api.programa.mover({ sesionId: s2.id, salaId: e.sala("Grande").id })).rejects.toMatchObject(msg);
    await expect(api.programa.quitar({ sesionId: s2.id })).rejects.toMatchObject(msg);
  });

  it("(g) mover a su mismo horario y sala no cuenta como solape consigo misma", async () => {
    const { e, api, s1 } = await preparado();
    await expect(api.programa.mover({ sesionId: s1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") })).resolves.toEqual({ id: s1.id });
  });

  it("(h) quien no es organizador no puede mover ni quitar", async () => {
    const { s1 } = await preparado();
    const api = await crearCaller((await crearUsuario(["COMITE"])).id, ANTES);
    await expect(api.programa.mover({ sesionId: s1.id, ...h(DIA1, "09:00", "09:30") })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(api.programa.quitar({ sesionId: s1.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
