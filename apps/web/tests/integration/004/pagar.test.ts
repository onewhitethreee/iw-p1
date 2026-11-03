import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";
import { A_2359, asistente, congresoConTarifas } from "./fixtures";

async function inscrito() {
  const c = await congresoConTarifas();
  const u = await asistente();
  const api = await crearCaller(u.id, A_2359);
  const i = await api.inscripcion.crear({ congresoId: c.id, tipoAsistente: "PROFESIONAL" });
  return { c, u, api, i };
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("inscripcion.pagar / mias (spec-004 US2)", () => {
  it("(a) US2-1: pago aprobado confirma, genera código UUID v4 y registra el pago", async () => {
    const { api, i } = await inscrito();
    expect(await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111 1111 1111 1234" })).toMatchObject({ resultado: "APROBADO" });
    const ins = await db.inscripcion.findUniqueOrThrow({ where: { id: i.id }, include: { pagos: true } });
    expect(ins.estado).toBe("CONFIRMADA");
    expect(ins.confirmadaEn).not.toBeNull();
    expect(ins.codigoAcreditacion).toMatch(UUID_V4);
    expect(ins.pagos).toHaveLength(1);
    expect(ins.pagos[0]).toMatchObject({ resultado: "APROBADO", importeCent: 25000 });
    expect(ins.pagos[0]!.referencia).toMatch(/^SIM-[0-9a-f]{8}-1234$/);
  });

  it("(b) US2-2: la tarjeta de rechazo deja la inscripción pendiente; luego puede pagarse", async () => {
    const { api, i } = await inscrito();
    expect(await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4000 0000 0000 0002" })).toEqual({
      resultado: "RECHAZADO",
      mensaje: "El pago ha sido rechazado. Prueba con otra tarjeta.",
    });
    let ins = await db.inscripcion.findUniqueOrThrow({ where: { id: i.id }, include: { pagos: true } });
    expect(ins).toMatchObject({ estado: "PENDIENTE_PAGO", codigoAcreditacion: null });
    expect(ins.pagos.map((p) => p.resultado)).toEqual(["RECHAZADO"]);
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "5555555555554444" });
    ins = await db.inscripcion.findUniqueOrThrow({ where: { id: i.id }, include: { pagos: true } });
    expect(ins.estado).toBe("CONFIRMADA");
  });

  it("(c) US2-3: una inscripción confirmada no se vuelve a pagar", async () => {
    const { api, i } = await inscrito();
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111111111111111" });
    await expect(api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111111111111111" })).rejects.toMatchObject({ code: "CONFLICT", message: "Esta inscripción ya está pagada" });
  });

  it("(d) US2-4: no se puede pagar la inscripción de otra persona", async () => {
    const { i } = await inscrito();
    const otro = await crearCaller((await asistente()).id, A_2359);
    await expect(otro.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111111111111111" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("(e) tarjeta no válida → BAD_REQUEST sin crear pago", async () => {
    const { api, i } = await inscrito();
    for (const tarjeta of ["411111111111111", "4111 1111 1111 111a", ""]) {
      await expect(api.inscripcion.pagar({ inscripcionId: i.id, tarjeta })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(await db.pago.count({ where: { inscripcionId: i.id } })).toBe(0);
  });

  it("(f) ningún pago guarda el número completo de la tarjeta", async () => {
    const { api, i } = await inscrito();
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4000 0000 0000 0002" });
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111 1111 1111 9876" });
    const texto = JSON.stringify(await db.pago.findMany({ where: { inscripcionId: i.id } }));
    expect(texto).not.toContain("4000000000000002");
    expect(texto).not.toContain("4111111111119876");
  });

  it("(g) dos pagos simultáneos → exactamente un APROBADO", async () => {
    const { api, i } = await inscrito();
    await Promise.allSettled([
      api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111111111111111" }),
      api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111111111111111" }),
    ]);
    expect(await db.pago.count({ where: { inscripcionId: i.id, resultado: "APROBADO" } })).toBe(1);
  });

  it("(h) US2-5: mias devuelve QR solo de confirmadas y solo las propias", async () => {
    const { api, i, u } = await inscrito();
    let [m] = await api.inscripcion.mias();
    expect(m).toMatchObject({ id: i.id, estado: "PENDIENTE_PAGO", qr: null, codigo: null });
    await api.inscripcion.pagar({ inscripcionId: i.id, tarjeta: "4111111111111111" });
    [m] = await api.inscripcion.mias();
    expect(m!.qr).toMatch(/^data:image\/png;base64,/);
    expect(m!.codigo).toMatch(UUID_V4);
    const otro = await crearCaller((await asistente()).id);
    expect(await otro.inscripcion.mias()).toEqual([]);
    void u;
  });
});
