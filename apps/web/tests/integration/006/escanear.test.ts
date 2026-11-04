import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { AHORA, asistente, escenario, min } from "./fixtures";

async function puertaCaller(usuarioId: string, ahora = AHORA) {
  return crearCaller(usuarioId, ahora);
}

const reservar = (inscripcionId: string, sesionId: string) => db.entradaAgenda.create({ data: { inscripcionId, sesionId } });

describe("acreditacion.escanear (US1)", () => {
  it("(a) US1-1 admite, registra la asistencia con quien la registró y devuelve nombre y ocupación", async () => {
    const { c, s, puerta } = await escenario();
    const { ins, codigo } = await asistente(c.id, "CONFIRMADA", "Lucía Asistente");
    const api = await puertaCaller(puerta.id);
    const t0 = performance.now();
    const r = await api.acreditacion.escanear({ sesionId: s.grande.id, codigo });
    const ms = performance.now() - t0;
    expect(r).toEqual({ resultado: "ADMITIDO", motivo: "Admitido", asistente: "Lucía Asistente", ocupacion: { asistencias: 1, aforo: 100 } });
    const a = await db.asistencia.findUniqueOrThrow({ where: { inscripcionId_sesionId: { inscripcionId: ins.id, sesionId: s.grande.id } } });
    expect(a.registradaPorId).toBe(puerta.id);
    expect(ms).toBeLessThan(1000); // SC-001
  });

  it("(b) US1-2 aforo completo → RECHAZADO «Aforo completo» sin crear asistencia", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id);
    await reservar(a.ins.id, s.pequena.id);
    const b = await asistente(c.id);
    const api = await puertaCaller(puerta.id);
    expect((await api.acreditacion.escanear({ sesionId: s.pequena.id, codigo: a.codigo })).resultado).toBe("ADMITIDO");
    const r = await api.acreditacion.escanear({ sesionId: s.pequena.id, codigo: b.codigo });
    expect(r).toEqual({ resultado: "RECHAZADO", motivo: "Aforo completo", asistente: null, ocupacion: { asistencias: 1, aforo: 1 } });
    expect(await db.asistencia.count({ where: { sesionId: s.pequena.id } })).toBe(1);
  });

  it("(c) US1-3 código desconocido → «Acreditación no válida»", async () => {
    const { s, puerta } = await escenario();
    const api = await puertaCaller(puerta.id);
    const r = await api.acreditacion.escanear({ sesionId: s.grande.id, codigo: "codigo-inventado" });
    expect(r).toMatchObject({ resultado: "RECHAZADO", motivo: "Acreditación no válida", asistente: null });
    expect(await db.asistencia.count()).toBe(0);
  });

  it("(d) US1-4 inscripción pendiente → «Inscripción no confirmada»; otro congreso → «Acreditación de otro congreso»", async () => {
    const { c, s, puerta } = await escenario();
    const otro = await escenario();
    // La regla se comprueba en el servidor aunque una inscripción pendiente no debería tener código
    const pendiente = await asistente(c.id, "PENDIENTE_PAGO");
    const ajeno = await asistente(otro.c.id);
    const api = await puertaCaller(puerta.id);
    expect(await api.acreditacion.escanear({ sesionId: s.grande.id, codigo: pendiente.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "Inscripción no confirmada",
    });
    expect(await api.acreditacion.escanear({ sesionId: s.grande.id, codigo: ajeno.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "Acreditación de otro congreso",
    });
    expect(await db.asistencia.count()).toBe(0);
  });

  it("(e) US1-5 segundo escaneo → YA_REGISTRADO sin nueva asistencia, también con la sala llena", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id, "CONFIRMADA", "Mario Repetido");
    const api = await puertaCaller(puerta.id);
    await api.acreditacion.escanear({ sesionId: s.pequena.id, codigo: a.codigo });
    const r = await api.acreditacion.escanear({ sesionId: s.pequena.id, codigo: a.codigo });
    expect(r).toEqual({
      resultado: "YA_REGISTRADO",
      motivo: "Ya registrado en esta sesión",
      asistente: "Mario Repetido",
      ocupacion: { asistencias: 1, aforo: 1 },
    });
    expect(await db.asistencia.count({ where: { sesionId: s.pequena.id } })).toBe(1);
  });

  it("(f) US1-6 sin rol ACREDITACION → FORBIDDEN en los tres procedimientos", async () => {
    const { c, s } = await escenario();
    const a = await asistente(c.id);
    for (const roles of [["ASISTENTE"], ["ORGANIZADOR"], ["COMITE", "PONENTE"]] as const) {
      const u = await crearUsuario([...roles]);
      const api = await puertaCaller(u.id);
      await expect(api.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo })).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(api.acreditacion.sesiones({ congresoId: c.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(api.acreditacion.ocupacion({ sesionId: s.grande.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
    const anonimo = await crearCaller(null, AHORA);
    await expect(anonimo.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo })).rejects.toBeInstanceOf(TRPCError);
    expect(await db.asistencia.count()).toBe(0);
  });

  it("(g) FR-010 ventana de acceso [inicio − 30 min, fin)", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id);
    const b = await asistente(c.id);
    const antes = await puertaCaller(puerta.id, min(-31));
    expect(await antes.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "La sesión aún no está abierta (se abre a las 09:30)",
    });
    const justo = await puertaCaller(puerta.id, min(-30));
    expect((await justo.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo })).resultado).toBe("ADMITIDO");
    const fin = await puertaCaller(puerta.id, min(60));
    expect(await fin.acreditacion.escanear({ sesionId: s.grande.id, codigo: b.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "La sesión ya ha terminado",
    });
  });

  it("(h) FR-009 sin la sesión en la agenda → admitido si quedan plazas sin reservar", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id);
    const api = await puertaCaller(puerta.id);
    expect((await api.acreditacion.escanear({ sesionId: s.doble.id, codigo: a.codigo })).resultado).toBe("ADMITIDO");
  });

  it("(h2) clarify P3: las plazas reservadas quedan para quien reservó (antes de inicio + 10 min, spec-005 P2)", async () => {
    const { c, s, puerta } = await escenario();
    const conReserva = await asistente(c.id);
    await reservar(conReserva.ins.id, s.doble.id);
    const sinReserva1 = await asistente(c.id);
    const sinReserva2 = await asistente(c.id);
    const api = await puertaCaller(puerta.id, min(5)); // analyze-3 A1: AHORA (+10 min) ya es el límite
    expect((await api.acreditacion.escanear({ sesionId: s.doble.id, codigo: sinReserva1.codigo })).resultado).toBe("ADMITIDO");
    expect(await api.acreditacion.escanear({ sesionId: s.doble.id, codigo: sinReserva2.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "No quedan plazas sin reservar",
      ocupacion: { asistencias: 1, aforo: 2 },
    });
    expect((await api.acreditacion.escanear({ sesionId: s.doble.id, codigo: conReserva.codigo })).resultado).toBe("ADMITIDO");
  });

  it("(i) SC-002 10 escaneos simultáneos con 1 plaza → solo 1 admitido", async () => {
    const { c, s, puerta } = await escenario();
    const otraPuerta = await crearUsuario(["ACREDITACION"]);
    const asistentes = await Promise.all(Array.from({ length: 10 }, () => asistente(c.id)));
    const apis = [await puertaCaller(puerta.id), await puertaCaller(otraPuerta.id)];
    const rs = await Promise.all(asistentes.map((a, i) => apis[i % 2]!.acreditacion.escanear({ sesionId: s.pequena.id, codigo: a.codigo })));
    expect(rs.filter((r) => r.resultado === "ADMITIDO")).toHaveLength(1);
    expect(rs.filter((r) => r.resultado === "RECHAZADO")).toHaveLength(9);
    expect(await db.asistencia.count({ where: { sesionId: s.pequena.id } })).toBe(1);
  });

  it("(i2) el mismo código escaneado a la vez en dos puertas → una admisión y un «ya registrado»", async () => {
    const { c, s, puerta } = await escenario();
    const otraPuerta = await crearUsuario(["ACREDITACION"]);
    const a = await asistente(c.id);
    const rs = await Promise.all([
      (await puertaCaller(puerta.id)).acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo }),
      (await puertaCaller(otraPuerta.id)).acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo }),
    ]);
    expect(rs.map((r) => r.resultado).sort()).toEqual(["ADMITIDO", "YA_REGISTRADO"]);
    expect(await db.asistencia.count()).toBe(1);
  });

  it("(j) el código se acepta con espacios alrededor; vacío → error de validación", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id);
    const api = await puertaCaller(puerta.id);
    expect((await api.acreditacion.escanear({ sesionId: s.grande.id, codigo: `  ${a.codigo}\n` })).resultado).toBe("ADMITIDO");
    await expect(api.acreditacion.escanear({ sesionId: s.grande.id, codigo: "   " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("sesión inexistente → NOT_FOUND", async () => {
    const { c, puerta } = await escenario();
    const a = await asistente(c.id);
    const api = await puertaCaller(puerta.id);
    await expect(api.acreditacion.escanear({ sesionId: "no-existe", codigo: a.codigo })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("escanear tras clarify-3 / spec-005 P2 (T011, T012)", () => {
  it("(k) FR-009 matizada: desde inicio + 10 min las reservas no presentadas dejan de guardar la plaza", async () => {
    const { c, s, puerta } = await escenario();
    const [r1, r2, sin] = [await asistente(c.id), await asistente(c.id), await asistente(c.id)];
    await reservar(r1.ins.id, s.doble.id);
    await reservar(r2.ins.id, s.doble.id); // aforo 2, 2 reservas, nadie ha entrado
    const a = (m: number) => puertaCaller(puerta.id, min(m));
    expect(await (await a(9)).acreditacion.escanear({ sesionId: s.doble.id, codigo: sin.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "No quedan plazas sin reservar",
    });
    expect((await (await a(10)).acreditacion.escanear({ sesionId: s.doble.id, codigo: sin.codigo })).resultado).toBe("ADMITIDO");
    expect((await (await a(11)).acreditacion.escanear({ sesionId: s.doble.id, codigo: r1.codigo })).resultado).toBe("ADMITIDO");
    expect(await (await a(12)).acreditacion.escanear({ sesionId: s.doble.id, codigo: r2.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "Aforo completo",
    });
    expect(await db.entradaAgenda.count({ where: { sesionId: s.doble.id } })).toBe(2); // las reservas siguen en la agenda
  });

  it("(l) US1-8 / FR-011: no entra en una sesión solapada con otra en la que ya está; sí en una contigua", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id);
    const api = await puertaCaller(puerta.id);
    expect((await api.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo })).resultado).toBe("ADMITIDO");
    expect(await api.acreditacion.escanear({ sesionId: s.pequena.id, codigo: a.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "Ya registrado en «En sala grande» a esta hora",
      ocupacion: { asistencias: 0, aforo: 1 },
    });
    const autor = await crearUsuario(["PONENTE"]);
    const p = await db.propuesta.create({
      data: { congresoId: c.id, areaId: c.areas[0]!.id, autorId: autor.id, titulo: "Contigua", resumen: "r".repeat(120), estado: "ACEPTADA" },
    });
    const contigua = await db.sesion.create({
      data: { congresoId: c.id, propuestaId: p.id, salaId: c.salas.find((x) => x.nombre === "Doble")!.id, inicio: min(60), fin: min(120) },
    });
    const luego = await puertaCaller(puerta.id, min(55));
    expect((await luego.acreditacion.escanear({ sesionId: contigua.id, codigo: a.codigo })).resultado).toBe("ADMITIDO");
  });

  it("(m) FR-011 concurrente: el mismo código a la vez en dos sesiones solapadas → una sola asistencia", async () => {
    for (let k = 0; k < 5; k++) {
      const { c, s, puerta } = await escenario();
      const otraPuerta = await crearUsuario(["ACREDITACION"]);
      const a = await asistente(c.id);
      const rs = await Promise.all([
        (await puertaCaller(puerta.id)).acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo }),
        (await puertaCaller(otraPuerta.id)).acreditacion.escanear({ sesionId: s.doble.id, codigo: a.codigo }),
      ]);
      expect(rs.map((r) => r.resultado).sort()).toEqual(["ADMITIDO", "RECHAZADO"]);
      expect(await db.asistencia.count({ where: { inscripcionId: a.ins.id } })).toBe(1);
    }
  });

  it("(n) analyze-3 A3: agenda.anadir ∥ escanear de la misma persona y sesión no se interbloquean", async () => {
    for (let k = 0; k < 5; k++) {
      const { c, s, puerta } = await escenario();
      const a = await asistente(c.id);
      const r = await Promise.allSettled([
        (await crearCaller(a.u.id, min(-20))).agenda.anadir({ sesionId: s.grande.id }),
        (await puertaCaller(puerta.id, min(-20))).acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo }),
      ]);
      expect(r.map((x) => x.status)).toEqual(["fulfilled", "fulfilled"]);
    }
  });
});

describe("acreditacion.sesiones (US1, FR-002)", () => {
  it("lista las sesiones del congreso por hora con sala, aforo, asistencias y si está abierta", async () => {
    const { c, s, puerta } = await escenario();
    const a = await asistente(c.id);
    const api = await puertaCaller(puerta.id);
    await api.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo });
    const lista = await api.acreditacion.sesiones({ congresoId: c.id });
    expect(lista).toHaveLength(3);
    const g = lista.find((x) => x.id === s.grande.id)!;
    expect(g).toMatchObject({ titulo: "En sala grande", sala: "Grande", aforo: 100, asistencias: 1, abierta: true });
    const tarde = await puertaCaller(puerta.id, min(120));
    expect((await tarde.acreditacion.sesiones({ congresoId: c.id })).every((x) => !x.abierta)).toBe(true);
  });
});

describe("acreditacion.ocupacion (US2, FR-007)", () => {
  it("US2-1 refleja las admisiones hechas desde otra puerta", async () => {
    const { c, s, puerta } = await escenario();
    const otraPuerta = await crearUsuario(["ACREDITACION"]);
    const miPuerta = await puertaCaller(puerta.id);
    expect(await miPuerta.acreditacion.ocupacion({ sesionId: s.grande.id })).toEqual({ asistencias: 0, aforo: 100 });
    const otra = await puertaCaller(otraPuerta.id);
    for (const a of [await asistente(c.id), await asistente(c.id)]) {
      await otra.acreditacion.escanear({ sesionId: s.grande.id, codigo: a.codigo });
    }
    expect(await miPuerta.acreditacion.ocupacion({ sesionId: s.grande.id })).toEqual({ asistencias: 2, aforo: 100 });
  });

  it("sin rol ACREDITACION → FORBIDDEN; sesión inexistente → NOT_FOUND", async () => {
    const { s, puerta } = await escenario();
    const u = await crearUsuario(["ASISTENTE"]);
    await expect((await puertaCaller(u.id)).acreditacion.ocupacion({ sesionId: s.grande.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect((await puertaCaller(puerta.id)).acreditacion.ocupacion({ sesionId: "x" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
