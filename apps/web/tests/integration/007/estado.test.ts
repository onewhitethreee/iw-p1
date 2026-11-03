import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { asistente, DESPUES, DURANTE, escenario, FIN } from "./fixtures";

describe("certificado.estado (US1)", () => {
  it("(a) US1-1 4 de 5 con el congreso finalizado → DISPONIBLE, 80 %, horas de las asistidas y sesiones marcadas", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 4 });
    const r = await (await crearCaller(u.id, DESPUES)).certificado.estado({ congresoId: e.c.id });
    expect(r).toMatchObject({ estado: "DISPONIBLE", disponible: true, motivo: "Disponible", porcentaje: 80, asistidas: 4, total: 5 });
    expect(r.horas).toEqual({ minutos: 270, texto: "4 h 30 min" });
    expect(r.sesiones).toHaveLength(5);
    expect(r.sesiones.map((s) => s.asistida)).toEqual([true, true, true, true, false]);
    expect(r.sesiones[0]).toMatchObject({ titulo: "Sesión 1", sala: "Sala" });
  });

  it("(b) US1-2 3 de 5 → BAJO_UMBRAL con el motivo", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 3 });
    const r = await (await crearCaller(u.id, DESPUES)).certificado.estado({ congresoId: e.c.id });
    expect(r).toMatchObject({
      estado: "BAJO_UMBRAL",
      disponible: false,
      porcentaje: 60,
      motivo: "No disponible: has asistido al 60 % de las sesiones de tu agenda (3 de 5); se necesita al menos el 80 %",
    });
  });

  it("(c) US1-4 congreso sin terminar → NO_FINALIZADO con fecha y porcentaje provisional; en el fin exacto ya está disponible", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 2 });
    const r = await (await crearCaller(u.id, DURANTE)).certificado.estado({ congresoId: e.c.id });
    expect(r).toMatchObject({
      estado: "NO_FINALIZADO",
      disponible: false,
      motivo: "Disponible cuando termine el congreso (12 de mayo de 2027)",
      porcentaje: 40,
      asistidas: 2,
      total: 5,
    });
    const otro = await asistente(e, { asistidas: 5, nombre: "Pleno" });
    expect((await (await crearCaller(otro.u.id, FIN)).certificado.estado({ congresoId: e.c.id })).estado).toBe("DISPONIBLE");
    expect((await (await crearCaller(otro.u.id, new Date(FIN.getTime() - 1))).certificado.estado({ congresoId: e.c.id })).estado).toBe(
      "NO_FINALIZADO",
    );
  });

  it("(d) US1-5 agenda vacía → AGENDA_VACIA", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { enAgenda: 0 });
    const r = await (await crearCaller(u.id, DESPUES)).certificado.estado({ congresoId: e.c.id });
    expect(r).toMatchObject({ estado: "AGENDA_VACIA", disponible: false, motivo: "No disponible: tu agenda no tiene sesiones", porcentaje: 0, total: 0 });
  });

  it("(e) US1-7 sin inscripción o pendiente de pago → SIN_INSCRIPCION", async () => {
    const e = await escenario();
    const sin = await crearUsuario(["ASISTENTE"]);
    const pendiente = await asistente(e, { estado: "PENDIENTE_PAGO" });
    for (const id of [sin.id, pendiente.u.id]) {
      const r = await (await crearCaller(id, DESPUES)).certificado.estado({ congresoId: e.c.id });
      expect(r).toMatchObject({
        estado: "SIN_INSCRIPCION",
        disponible: false,
        motivo: "No tienes una inscripción confirmada en este congreso",
        total: 0,
        sesiones: [],
      });
    }
  });

  it("(f) Edge: las asistencias fuera de la agenda no cuentan; 2 de 3 se muestra «66 %»", async () => {
    const e = await escenario();
    const { u, ins } = await asistente(e, { enAgenda: 3, asistidas: 2 });
    await db.asistencia.create({ data: { inscripcionId: ins.id, sesionId: e.fuera.id, registradaPorId: e.puerta.id } });
    const r = await (await crearCaller(u.id, DESPUES)).certificado.estado({ congresoId: e.c.id });
    expect(r).toMatchObject({ estado: "BAJO_UMBRAL", porcentaje: 66, asistidas: 2, total: 3 });
    expect(r.sesiones.map((s) => s.titulo)).not.toContain("Sesión 6");
    expect(r.horas.minutos).toBe(150);
  });

  it("(g) P1: el titular con cualquier rol obtiene su estado; el organizador nunca el de otro; sin sesión → UNAUTHORIZED; congreso inexistente → NOT_FOUND", async () => {
    const e = await escenario();
    const ponente = await asistente(e, { asistidas: 4, roles: ["PONENTE", "ASISTENTE"] });
    expect((await (await crearCaller(ponente.u.id, DESPUES)).certificado.estado({ congresoId: e.c.id })).estado).toBe("DISPONIBLE");
    const org = await crearUsuario(["ORGANIZADOR"]);
    expect((await (await crearCaller(org.id, DESPUES)).certificado.estado({ congresoId: e.c.id })).estado).toBe("SIN_INSCRIPCION");
    await expect((await crearCaller(null, DESPUES)).certificado.estado({ congresoId: e.c.id })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect((await crearCaller(ponente.u.id, DESPUES)).certificado.estado({ congresoId: "no-existe" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("certificado.congresos", () => {
  it("(h) lista solo los congresos con inscripción confirmada del usuario, con `finalizado`", async () => {
    const e1 = await escenario();
    const e2 = await escenario();
    const { u } = await asistente(e1, { asistidas: 4 });
    await db.inscripcion.create({
      data: { congresoId: e2.c.id, usuarioId: u.id, tipoAsistente: "PROFESIONAL", tarifaAplicada: "GENERAL", importeCent: 1, estado: "PENDIENTE_PAGO" },
    });
    const lista = await (await crearCaller(u.id, DESPUES)).certificado.congresos();
    expect(lista).toEqual([{ id: e1.c.id, slug: e1.c.slug, nombre: e1.c.nombre, fin: FIN, zonaHoraria: "Europe/Madrid", finalizado: true }]);
    const durante = await (await crearCaller(u.id, DURANTE)).certificado.congresos();
    expect(durante[0]!.finalizado).toBe(false);
    await expect((await crearCaller(null)).certificado.congresos()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
