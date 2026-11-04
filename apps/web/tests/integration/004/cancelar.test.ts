import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";
import { A_0000, A_2359, asistente, congresoConTarifas } from "./fixtures";

/** spec-004 T014 · FR-014, FR-003, FR-011 (clarify-2 P4; plan decisiones 2, 3 y 8, R7). */
async function pendiente(tipoAsistente: "ESTUDIANTE" | "PROFESIONAL" = "ESTUDIANTE") {
  const c = await congresoConTarifas();
  const u = await asistente();
  const api = await crearCaller(u.id, A_2359);
  const i = await api.inscripcion.crear({ congresoId: c.id, tipoAsistente });
  return { c, u, api, i };
}

const leer = (id: string) => db.inscripcion.findUniqueOrThrow({ where: { id }, include: { pagos: true } });

describe("inscripcion.cancelar (spec-004 FR-014, clarify-2 P4)", () => {
  it("(a) US2-6: una pendiente pasa a CANCELADA y conserva sus intentos de pago", async () => {
    const { api, i } = await pendiente();
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4000 0000 0000 0002" });
    expect(await api.inscripcion.cancelar({ inscripcionId: i.id })).toEqual({ estado: "CANCELADA" });
    const ins = await leer(i.id);
    expect(ins.estado).toBe("CANCELADA");
    expect(ins.pagos.map((p) => p.resultado)).toEqual(["RECHAZADO"]);
  });

  it("(b) US2-6: volver a inscribirse con otro tipo reutiliza la inscripción con el tipo y el precio de ese día", async () => {
    const { c, api, i } = await pendiente("ESTUDIANTE");
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4000 0000 0000 0002" });
    await api.inscripcion.cancelar({ inscripcionId: i.id });
    const r = await api.inscripcion.crear({ congresoId: c.id, tipoAsistente: "PROFESIONAL" });
    expect(r).toEqual({ id: i.id, importeCent: 25000, tarifaAplicada: "TEMPRANA" });
    const ins = await leer(i.id);
    expect(ins).toMatchObject({ estado: "PENDIENTE_PAGO", tipoAsistente: "PROFESIONAL", importeCent: 25000 });
    expect(ins.pagos).toHaveLength(1); // el intento rechazado anterior se conserva
    expect(await db.inscripcion.count({ where: { congresoId: c.id } })).toBe(1);
  });

  it("(c) US2-7: una confirmada no se cancela y no cambia", async () => {
    const { api, i } = await pendiente();
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111 1111 1111 1111" });
    await expect(api.inscripcion.cancelar({ inscripcionId: i.id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Una inscripción pagada no se puede cancelar",
    });
    expect((await leer(i.id)).estado).toBe("CONFIRMADA");
  });

  it("(d) US2-7: una inscripción ajena o inexistente → FORBIDDEN, sin cambios", async () => {
    const { i } = await pendiente();
    const otro = await crearCaller((await asistente()).id, A_2359);
    const ajena = { code: "FORBIDDEN", message: "No puedes cancelar una inscripción de otra persona" };
    await expect(otro.inscripcion.cancelar({ inscripcionId: i.id })).rejects.toMatchObject(ajena);
    await expect(otro.inscripcion.cancelar({ inscripcionId: "no-existe" })).rejects.toMatchObject(ajena);
    expect((await leer(i.id)).estado).toBe("PENDIENTE_PAGO");
  });

  it("(e) una ya cancelada → CONFLICT", async () => {
    const { api, i } = await pendiente();
    await api.inscripcion.cancelar({ inscripcionId: i.id });
    await expect(api.inscripcion.cancelar({ inscripcionId: i.id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Esta inscripción ya está cancelada",
    });
  });

  it("(f) pagar una cancelada → CONFLICT y no se registra ningún pago", async () => {
    const { api, i } = await pendiente();
    await api.inscripcion.cancelar({ inscripcionId: i.id });
    await expect(api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111 1111 1111 1111" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Esta inscripción está cancelada",
    });
    expect(await leer(i.id)).toMatchObject({ estado: "CANCELADA", pagos: [] });
  });

  it("(g) cancelar ∥ pagar: o confirmada con pago aprobado, o cancelada sin él; nunca las dos cosas", async () => {
    for (let k = 0; k < 5; k++) {
      const { api, i } = await pendiente();
      await Promise.allSettled([
        api.inscripcion.cancelar({ inscripcionId: i.id }),
        api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111 1111 1111 1111" }),
      ]);
      const ins = await leer(i.id);
      const aprobados = ins.pagos.filter((p) => p.resultado === "APROBADO").length;
      expect([`${ins.estado}:${aprobados}`]).toContainEqual(expect.stringMatching(/^(CONFIRMADA:1|CANCELADA:0)$/));
    }
  });

  it("(h) volver a inscribirse después del día límite temprano aplica el precio general", async () => {
    const { c, u, api, i } = await pendiente("ESTUDIANTE"); // creada a las 23:59 del día límite: temprana
    await api.inscripcion.cancelar({ inscripcionId: i.id });
    const despues = await crearCaller(u.id, A_0000);
    expect(await despues.inscripcion.crear({ congresoId: c.id, tipoAsistente: "ESTUDIANTE" })).toEqual({
      id: i.id,
      importeCent: 12000,
      tarifaAplicada: "GENERAL",
    });
  });
});
