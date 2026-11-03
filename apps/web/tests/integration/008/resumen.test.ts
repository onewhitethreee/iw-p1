import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { AHORA, asistir, escenario, FIN_CONGRESO, inscribir, min, reservar } from "./fixtures";

const panel = async (orgId: string, ahora = AHORA) => (await crearCaller(orgId, ahora)).panel;

describe("panel.resumen · inscripciones e ingresos (US1)", () => {
  it("(a) US1-1 confirmadas, pendientes, ingresos de pagos aprobados y desglose de 6 filas", async () => {
    const e = await escenario();
    await inscribir(e.c.id, "PROFESIONAL", "TEMPRANA", "CONFIRMADA", [{ cent: 12050, aprobado: true }]);
    await inscribir(e.c.id, "PROFESIONAL", "TEMPRANA", "CONFIRMADA", [{ cent: 12000, aprobado: false }, { cent: 12050, aprobado: true }]);
    await inscribir(e.c.id, "ESTUDIANTE", "GENERAL", "CONFIRMADA", [{ cent: 4000, aprobado: true }]);
    await inscribir(e.c.id, "SOCIO", "GENERAL", "PENDIENTE_PAGO", [{ cent: 9000, aprobado: false }]);
    await inscribir(e.c.id, "SOCIO", "TEMPRANA", "PENDIENTE_PAGO");
    const r = await (await panel(e.org.id)).resumen({ congresoId: e.c.id });
    expect(r.inscripciones).toEqual({ confirmadas: 3, pendientes: 2 });
    expect(r.ingresosCent).toBe(28100);
    expect(r.desglose).toHaveLength(6);
    const fila = (t: string, f: string) => r.desglose.find((d) => d.tipoAsistente === t && d.tarifa === f)!;
    expect(fila("PROFESIONAL", "TEMPRANA")).toEqual({ tipoAsistente: "PROFESIONAL", tarifa: "TEMPRANA", confirmadas: 2, pendientes: 0, ingresosCent: 24100 });
    expect(fila("ESTUDIANTE", "GENERAL")).toMatchObject({ confirmadas: 1, ingresosCent: 4000 });
    expect(fila("SOCIO", "GENERAL")).toMatchObject({ confirmadas: 0, pendientes: 1, ingresosCent: 0 });
    expect(fila("SOCIO", "TEMPRANA")).toMatchObject({ pendientes: 1, ingresosCent: 0 });
    expect(fila("ESTUDIANTE", "TEMPRANA")).toMatchObject({ confirmadas: 0, pendientes: 0, ingresosCent: 0 });
  });

  it("(b) SC-002 el desglose suma el total y coincide al céntimo con la BD", async () => {
    const e = await escenario();
    const tipos = ["PROFESIONAL", "SOCIO", "ESTUDIANTE"] as const;
    for (let i = 0; i < 30; i++) {
      await inscribir(e.c.id, tipos[i % 3]!, i % 2 ? "TEMPRANA" : "GENERAL", i % 5 ? "CONFIRMADA" : "PENDIENTE_PAGO", [{ cent: 1001 + i * 37, aprobado: i % 5 !== 0 }]);
    }
    const r = await (await panel(e.org.id)).resumen({ congresoId: e.c.id });
    const [fila] = await db.$queryRaw<{ total: bigint }[]>`
      SELECT COALESCE(SUM(p."importeCent"), 0) AS total FROM "Pago" p JOIN "Inscripcion" i ON i.id = p."inscripcionId"
      WHERE i."congresoId" = ${e.c.id} AND p.resultado = 'APROBADO'`;
    expect(r.ingresosCent).toBe(Number(fila!.total));
    expect(r.desglose.reduce((a, d) => a + d.ingresosCent, 0)).toBe(r.ingresosCent);
    expect(r.desglose.reduce((a, d) => a + d.confirmadas + d.pendientes, 0)).toBe(30);
  });

  it("(c) US1-4 congreso sin inscripciones → ceros", async () => {
    const e = await escenario();
    const r = await (await panel(e.org.id)).resumen({ congresoId: e.c.id });
    expect(r.inscripciones).toEqual({ confirmadas: 0, pendientes: 0 });
    expect(r.ingresosCent).toBe(0);
    expect(r.desglose.every((d) => d.confirmadas === 0 && d.pendientes === 0 && d.ingresosCent === 0)).toBe(true);
    expect(r.desglose).toHaveLength(6);
  });

  it("(d) US1-2 un pago nuevo se ve en el siguiente resumen, con la hora del cálculo", async () => {
    const e = await escenario();
    const api = await panel(e.org.id);
    expect((await api.resumen({ congresoId: e.c.id })).calculadoEn).toEqual(AHORA);
    const ins = await inscribir(e.c.id, "SOCIO", "GENERAL", "PENDIENTE_PAGO");
    await db.pago.create({ data: { inscripcionId: ins.id, importeCent: 7000, resultado: "APROBADO", referencia: "x" } });
    await db.inscripcion.update({ where: { id: ins.id }, data: { estado: "CONFIRMADA" } });
    const r = await api.resumen({ congresoId: e.c.id });
    expect(r.ingresosCent).toBe(7000);
    expect(r.inscripciones.confirmadas).toBe(1);
  });

  it("(e) US1-3 solo ORGANIZADOR: FORBIDDEN en los tres procedimientos; congreso inexistente → NOT_FOUND", async () => {
    const e = await escenario();
    for (const rol of ["ASISTENTE", "COMITE", "ACREDITACION", "PONENTE"] as const) {
      const u = await crearUsuario([rol]);
      const api = await panel(u.id);
      await expect(api.resumen({ congresoId: e.c.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(api.salasLibres({ sesionId: e.s.tarde.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(api.cambiarSala({ sesionId: e.s.tarde.id, salaId: e.sala("Grande").id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
    await expect((await panel(e.org.id)).resumen({ congresoId: "no-existe" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("panel.resumen · ocupación de sesiones (US2)", () => {
  it("(a) US2-1 por sesión: datos, reservas, asistencias, ocupación y nivel (P1)", async () => {
    const e = await escenario();
    const a = await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA");
    const b = await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA");
    await asistir(a.id, e.s.enCurso.id, e.puerta.id);
    await asistir(b.id, e.s.enCurso.id, e.puerta.id);
    for (let i = 0; i < 9; i++) await reservar((await inscribir(e.c.id, "ESTUDIANTE", "GENERAL", "CONFIRMADA")).id, e.s.tarde.id);
    const r = await (await panel(e.org.id)).resumen({ congresoId: e.c.id });
    expect(r.sesiones.map((s) => s.titulo)).toEqual(["Mañana pasada", "En curso", "Tarde"]);
    const s = (t: string) => r.sesiones.find((x) => x.titulo === t)!;
    expect(s("En curso")).toMatchObject({ sala: "Pequeña", aforo: 2, reservas: 0, asistencias: 2, ocupacion: 100, nivel: "COMPLETA", inicio: min(0), fin: min(60) });
    expect(s("Tarde")).toMatchObject({ sala: "Mediana", aforo: 10, reservas: 9, asistencias: 0, ocupacion: 90, nivel: "CASI_COMPLETA" });
    expect(s("Mañana pasada")).toMatchObject({ ocupacion: 0, nivel: null });
  });

  it("(b) US2-2 una asistencia nueva se ve en el siguiente resumen", async () => {
    const e = await escenario();
    const api = await panel(e.org.id);
    const a = await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA");
    expect((await api.resumen({ congresoId: e.c.id })).sesiones.find((s) => s.id === e.s.enCurso.id)!.asistencias).toBe(0);
    await asistir(a.id, e.s.enCurso.id, e.puerta.id);
    expect((await api.resumen({ congresoId: e.c.id })).sesiones.find((s) => s.id === e.s.enCurso.id)!.asistencias).toBe(1);
  });

  it("(c) P3 movible: no en sesiones terminadas ni con el congreso finalizado; sí en la empezada", async () => {
    const e = await escenario();
    const r = await (await panel(e.org.id)).resumen({ congresoId: e.c.id });
    const mov = Object.fromEntries(r.sesiones.map((s) => [s.titulo, s.movible]));
    expect(mov).toEqual({ "Mañana pasada": false, "En curso": true, Tarde: true });
    const fin = await (await panel(e.org.id, FIN_CONGRESO)).resumen({ congresoId: e.c.id });
    expect(fin.sesiones.every((s) => !s.movible)).toBe(true);
  });

  it("(d) SC-004 con 1.000 inscripciones y 50 sesiones responde en < 2 s", async () => {
    const e = await escenario();
    const tipos = ["PROFESIONAL", "SOCIO", "ESTUDIANTE"] as const;
    const usuarios = Array.from({ length: 1000 }, (_, i) => ({ id: `carga-u-${i}-${e.c.id}`, nombre: "Carga", email: `carga${i}-${e.c.id}@t.es`, passwordHash: "x" }));
    await db.usuario.createMany({ data: usuarios });
    await db.inscripcion.createMany({
      data: usuarios.map((u, i) => ({
        id: `carga-i-${i}-${e.c.id}`,
        congresoId: e.c.id,
        usuarioId: u.id,
        tipoAsistente: tipos[i % 3]!,
        tarifaAplicada: i % 2 ? "TEMPRANA" : "GENERAL",
        importeCent: 5000,
        estado: i % 10 ? "CONFIRMADA" : "PENDIENTE_PAGO",
      })),
    });
    await db.pago.createMany({
      data: usuarios.map((_, i) => ({ inscripcionId: `carga-i-${i}-${e.c.id}`, importeCent: 5000, resultado: i % 10 ? "APROBADO" : "RECHAZADO", referencia: `c${i}` })),
    });
    for (let i = 0; i < 47; i++) await e.sesion(`Carga ${i}`, "Grande", 24 * 60 + i * 60, 24 * 60 + i * 60 + 50);
    const sesiones = await db.sesion.findMany({ where: { congresoId: e.c.id }, select: { id: true } });
    await db.entradaAgenda.createMany({
      data: usuarios.slice(0, 900).flatMap((_, i) => (i % 10 ? [{ inscripcionId: `carga-i-${i}-${e.c.id}`, sesionId: sesiones[i % sesiones.length]!.id }] : [])),
    });
    const api = await panel(e.org.id);
    const t0 = performance.now();
    const r = await api.resumen({ congresoId: e.c.id });
    const ms = performance.now() - t0;
    expect(r.sesiones).toHaveLength(50);
    expect(r.inscripciones).toEqual({ confirmadas: 900, pendientes: 100 });
    expect(r.ingresosCent).toBe(900 * 5000);
    expect(ms).toBeLessThan(2000);
  });
});
