import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { AHORA, asistente, escenario } from "./fixtures";

describe("agenda.anadir / sesiones (spec-005 US1)", () => {
  it("(a) US1-1: añade y refleja enAgenda y plazas libres", async () => {
    const { c, s } = await escenario();
    const { u } = await asistente(c.id);
    const api = await crearCaller(u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.a.id });
    const r = await api.agenda.sesiones({ congresoId: c.id });
    const a = r.sesiones.find((x) => x.id === s.a.id)!;
    expect(a).toMatchObject({ enAgenda: true, plazasLibres: 99, completa: false });
    expect((await api.agenda.congresos()).map((x) => x.slug)).toEqual([c.slug]);
  });

  it("(b) US1-2: solape → CONFLICT con título y horas", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.a.id });
    await expect(api.agenda.anadir({ sesionId: s.solapaA.id })).rejects.toMatchObject({ code: "CONFLICT", message: "Se solapa con «Sesión A» de 12:00 a 13:00" });
  });

  it("(c) US1-3: contiguas se aceptan", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.a.id });
    await expect(api.agenda.anadir({ sesionId: s.contigua.id })).resolves.toEqual({ ok: true });
  });

  it("(d) US1-4: aforo completo → CONFLICT y completa", async () => {
    const { c, s } = await escenario();
    await (await crearCaller((await asistente(c.id)).u.id, AHORA)).agenda.anadir({ sesionId: s.pequena.id });
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await expect(api.agenda.anadir({ sesionId: s.pequena.id })).rejects.toMatchObject({ code: "CONFLICT", message: "Aforo completo" });
    expect((await api.agenda.sesiones({ congresoId: c.id })).sesiones.find((x) => x.id === s.pequena.id)).toMatchObject({ completa: true, plazasLibres: 0 });
  });

  it("(e) US1-5 / SC-002: 20 asistentes a la vez por 1 plaza → 1 aceptado", async () => {
    const { c, s } = await escenario();
    const apis = await Promise.all(Array.from({ length: 20 }, async () => crearCaller((await asistente(c.id)).u.id, AHORA)));
    const r = await Promise.allSettled(apis.map((api) => api.agenda.anadir({ sesionId: s.pequena.id })));
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect(await db.entradaAgenda.count({ where: { sesionId: s.pequena.id } })).toBe(1);
  });

  it("(f) US1-6: sin inscripción confirmada → FORBIDDEN", async () => {
    const { c, s } = await escenario();
    const pendiente = await crearCaller((await asistente(c.id, "PENDIENTE_PAGO")).u.id, AHORA);
    const sinInscripcion = await crearCaller((await crearUsuario(["ASISTENTE"])).id, AHORA);
    for (const api of [pendiente, sinInscripcion]) {
      await expect(api.agenda.anadir({ sesionId: s.a.id })).rejects.toMatchObject({ code: "FORBIDDEN", message: "Necesitas una inscripción confirmada en este congreso" });
    }
  });

  it("(g) US1-7: duplicada → CONFLICT", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    await api.agenda.anadir({ sesionId: s.a.id });
    await expect(api.agenda.anadir({ sesionId: s.a.id })).rejects.toMatchObject({ code: "CONFLICT", message: "Esta sesión ya está en tu agenda" });
  });

  it("(h) FR-002: borrador → CONFLICT; sesión empezada → CONFLICT", async () => {
    const b = await escenario(false);
    await expect((await crearCaller((await asistente(b.c.id)).u.id, AHORA)).agenda.anadir({ sesionId: b.s.a.id })).rejects.toMatchObject({ code: "CONFLICT", message: "El programa aún no se ha publicado" });
    const { c, s } = await escenario();
    await expect((await crearCaller((await asistente(c.id)).u.id, AHORA)).agenda.anadir({ sesionId: s.empezada.id })).rejects.toMatchObject({ code: "CONFLICT", message: "La sesión ya ha empezado" });
  });

  it("(i) dos añadidos simultáneos de la misma persona con sesiones solapadas → solo uno", async () => {
    const { c, s } = await escenario();
    const api = await crearCaller((await asistente(c.id)).u.id, AHORA);
    const r = await Promise.allSettled([api.agenda.anadir({ sesionId: s.a.id }), api.agenda.anadir({ sesionId: s.solapaA.id })]);
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
  });
});
