import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";
import { AHORA, asistente, escenario, local } from "./fixtures";

describe("agenda.quitar / mia (spec-005 US2)", () => {
  it("(a) US2-1: mia ordenada por hora", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.pequena.id });
    await api.agenda.anadir({ sesionId: s.a.id });
    expect((await api.agenda.mia({ congresoId: c.id })).map((x) => x.titulo)).toEqual(["Sesión A", "En sala pequeña"]);
  });

  it("(b) US2-2: quitar libera la plaza", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.pequena.id });
    await api.agenda.quitar({ sesionId: s.pequena.id });
    expect(await db.entradaAgenda.count({ where: { sesionId: s.pequena.id } })).toBe(0);
    await expect((await crearCaller((await asistente(c.id)).u.id, AHORA)).agenda.anadir({ sesionId: s.pequena.id })).resolves.toEqual({ ok: true });
  });

  it("(c) US2-3: no se quita una sesión empezada", async () => {
    const { c, s } = await escenario();
    const { u, ins } = await asistente(c.id);
    await db.entradaAgenda.create({ data: { inscripcionId: ins.id, sesionId: s.empezada.id } });
    await expect((await crearCaller(u.id, AHORA)).agenda.quitar({ sesionId: s.empezada.id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sesión ya ha empezado: no se puede quitar de la agenda",
    });
  });

  it("(d) quitar algo que no está en la agenda → NOT_FOUND", async () => {
    const { c, s } = await escenario();
    await expect((await crearCaller((await asistente(c.id)).u.id, AHORA)).agenda.quitar({ sesionId: s.a.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("(e) US2-4 / FR-009: solapes creados por cambios del programa se conservan con aviso", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.a.id });
    await api.agenda.anadir({ sesionId: s.contigua.id });
    await db.sesion.update({ where: { id: s.contigua.id }, data: { inicio: local("12:30") } }); // el organizador la adelanta
    const mia = await api.agenda.mia({ congresoId: c.id });
    expect(mia).toHaveLength(2);
    expect(mia.find((x) => x.titulo === "Sesión A")!.solapaCon).toEqual(["Contigua"]);
    expect(mia.find((x) => x.titulo === "Contigua")!.solapaCon).toEqual(["Sesión A"]);
  });

  it("(f) un asistente no ve ni quita entradas de otro", async () => {
    const { c, s } = await escenario();
    await (await crearCaller((await asistente(c.id)).u.id, AHORA)).agenda.anadir({ sesionId: s.a.id });
    const otro = await crearCaller((await asistente(c.id)).u.id, AHORA);
    expect(await otro.agenda.mia({ congresoId: c.id })).toEqual([]);
    await expect(otro.agenda.quitar({ sesionId: s.a.id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await db.entradaAgenda.count({ where: { sesionId: s.a.id } })).toBe(1);
  });
});
