import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { crearCaller, crearUsuario } from "../helpers";
import { A_0000, A_2359, asistente, congresoConTarifas } from "./fixtures";

describe("inscripcion.crear / presupuesto (spec-004 US1)", () => {
  it("(a) US1-1: a las 23:59 del día límite se aplica la temprana y queda PENDIENTE_PAGO", async () => {
    const c = await congresoConTarifas();
    const u = await asistente();
    const r = await (await crearCaller(u.id, A_2359)).inscripcion.crear({ congresoId: c.id, tipoAsistente: "ESTUDIANTE" });
    expect(r).toMatchObject({ tarifaAplicada: "TEMPRANA", importeCent: 9000 });
    expect((await db.inscripcion.findUniqueOrThrow({ where: { id: r.id } })).estado).toBe("PENDIENTE_PAGO");
  });

  it("(b) US1-2: a las 00:00 del día siguiente se aplica la general", async () => {
    const c = await congresoConTarifas();
    const r = await (await crearCaller((await asistente()).id, A_0000)).inscripcion.crear({ congresoId: c.id, tipoAsistente: "ESTUDIANTE" });
    expect(r).toMatchObject({ tarifaAplicada: "GENERAL", importeCent: 12000 });
  });

  it("(c) US1-3: una segunda inscripción en el mismo congreso se rechaza", async () => {
    const c = await congresoConTarifas();
    const api = await crearCaller((await asistente()).id, A_2359);
    await api.inscripcion.crear({ congresoId: c.id, tipoAsistente: "SOCIO" });
    await expect(api.inscripcion.crear({ congresoId: c.id, tipoAsistente: "PROFESIONAL" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Ya tienes una inscripción en este congreso",
    });
    expect(await db.inscripcion.count({ where: { congresoId: c.id } })).toBe(1);
  });

  it("(d) US1-4: congreso finalizado → CONFLICT; en curso → se admite (clarify P2)", async () => {
    const c = await congresoConTarifas();
    const u = await asistente();
    await expect((await crearCaller(u.id, new Date(c.fin.getTime() + 1))).inscripcion.crear({ congresoId: c.id, tipoAsistente: "SOCIO" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "El congreso ha finalizado: ya no se admiten inscripciones",
    });
    const enCurso = new Date(c.inicio.getTime() + 3600_000);
    await expect((await crearCaller(u.id, enCurso)).inscripcion.crear({ congresoId: c.id, tipoAsistente: "SOCIO" })).resolves.toMatchObject({ tarifaAplicada: "GENERAL", importeCent: 22000 });
  });

  it("(e) US1-5/US1-6: sin sesión → UNAUTHORIZED; solo ponente → FORBIDDEN; tras añadirse el rol, se admite", async () => {
    const c = await congresoConTarifas();
    await expect((await crearCaller(null, A_2359)).inscripcion.crear({ congresoId: c.id, tipoAsistente: "SOCIO" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const ponente = await crearUsuario(["PONENTE"]);
    await expect((await crearCaller(ponente.id, A_2359)).inscripcion.crear({ congresoId: c.id, tipoAsistente: "SOCIO" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await db.usuarioRol.create({ data: { usuarioId: ponente.id, rol: "ASISTENTE" } });
    await expect((await crearCaller(ponente.id, A_2359)).inscripcion.crear({ congresoId: c.id, tipoAsistente: "SOCIO" })).resolves.toMatchObject({ importeCent: 18000 });
  });

  it("(f) US1-7: un importe enviado por el cliente se ignora", async () => {
    const c = await congresoConTarifas();
    const api = await crearCaller((await asistente()).id, A_2359);
    const r = await api.inscripcion.crear({ congresoId: c.id, tipoAsistente: "PROFESIONAL", importeCent: 1 } as never);
    expect(r.importeCent).toBe(25000);
  });

  it("(g) presupuesto es público y devuelve los 3 tipos con la tarifa vigente", async () => {
    const c = await congresoConTarifas();
    const r = await (await crearCaller(null, A_0000)).inscripcion.presupuesto({ congresoId: c.id });
    expect(r.tarifaAplicada).toBe("GENERAL");
    expect(r.tipos).toEqual([
      { tipoAsistente: "PROFESIONAL", importeCent: 30000 },
      { tipoAsistente: "SOCIO", importeCent: 22000 },
      { tipoAsistente: "ESTUDIANTE", importeCent: 12000 },
    ]);
  });

  it("(h) FR-011 / clarify P1: no existen operaciones para cambiar ni cancelar", () => {
    const procs = Object.keys(appRouter._def.procedures).filter((k) => k.startsWith("inscripcion."));
    expect(procs.sort()).toEqual(["inscripcion.crear", "inscripcion.mias", "inscripcion.pagar", "inscripcion.presupuesto"]);
  });
});
