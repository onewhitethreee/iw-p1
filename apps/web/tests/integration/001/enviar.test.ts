import { describe, expect, it } from "vitest";
import { inicioDeDia, inicioDelDiaSiguiente } from "@congresalia/domain";
import { db } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { crearCaller, crearUsuario } from "../helpers";
import { congresoConPlazo, DIA_APERTURA, DIA_CIERRE, dentroDelPlazo, resumenValido, ZONA } from "./fixtures";

const datos = (c: { id: string; area: { id: string } }) => ({
  congresoId: c.id,
  areaId: c.area.id,
  titulo: "Atención temprana en pediatría",
  resumen: resumenValido,
});

describe("propuesta.enviar (spec-001 US1)", () => {
  it("(a) US1-1: crea la propuesta ENVIADA con el autor de la sesión y la fecha de envío", async () => {
    const c = await congresoConPlazo();
    const ponente = await crearUsuario(["PONENTE"]);
    const ahora = dentroDelPlazo();
    const r = await (await crearCaller(ponente.id, ahora)).propuesta.enviar(datos(c));
    expect(r.estado).toBe("ENVIADA");
    const p = await db.propuesta.findUniqueOrThrow({ where: { id: r.id } });
    expect(p).toMatchObject({ autorId: ponente.id, estado: "ENVIADA", congresoId: c.id, areaId: c.area.id });
    expect(p.enviadaEn.toISOString()).toBe(ahora.toISOString());
  });

  it("(b) FR-002/FR-005a: 23:59 del día de cierre se acepta; 00:00 del día siguiente se rechaza sin guardar (US1-2)", async () => {
    const c = await congresoConPlazo();
    const ponente = await crearUsuario(["PONENTE"]);
    const medianoche = inicioDelDiaSiguiente(DIA_CIERRE, ZONA);
    const a2359 = new Date(medianoche.getTime() - 60_000);
    await expect((await crearCaller(ponente.id, a2359)).propuesta.enviar(datos(c))).resolves.toMatchObject({ estado: "ENVIADA" });
    await expect((await crearCaller(ponente.id, medianoche)).propuesta.enviar(datos(c))).rejects.toMatchObject({
      code: "CONFLICT",
      message: "El plazo de envío de propuestas de este congreso está cerrado",
    });
    expect(await db.propuesta.count()).toBe(1);
  });

  it("(c) US1-3: antes del día de apertura se rechaza indicando el día", async () => {
    const c = await congresoConPlazo();
    const ponente = await crearUsuario(["PONENTE"]);
    const antes = new Date(inicioDeDia(DIA_APERTURA, ZONA).getTime() - 1);
    await expect((await crearCaller(ponente.id, antes)).propuesta.enviar(datos(c))).rejects.toMatchObject({
      code: "CONFLICT",
      message: "El plazo de envío de este congreso se abre el 10 de enero de 2027",
    });
  });

  it("(d) US1-4: título o resumen fuera de longitud → BAD_REQUEST sin guardar", async () => {
    const c = await congresoConPlazo();
    const api = await crearCaller((await crearUsuario(["PONENTE"])).id, dentroDelPlazo());
    await expect(api.propuesta.enviar({ ...datos(c), resumen: "x".repeat(99) })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(api.propuesta.enviar({ ...datos(c), titulo: "Abcd" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(api.propuesta.enviar({ ...datos(c), areaId: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(await db.propuesta.count()).toBe(0);
  });

  it("(e) US1-5: un área de otro congreso se rechaza", async () => {
    const c = await congresoConPlazo();
    const otro = await congresoConPlazo();
    const api = await crearCaller((await crearUsuario(["PONENTE"])).id, dentroDelPlazo());
    await expect(api.propuesta.enviar({ ...datos(c), areaId: otro.area.id })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "El área temática no pertenece a este congreso",
    });
  });

  it("(f) US1-6: sin rol ponente → FORBIDDEN; sin sesión → UNAUTHORIZED", async () => {
    const c = await congresoConPlazo();
    const asistente = await crearUsuario(["ASISTENTE"]);
    await expect((await crearCaller(asistente.id, dentroDelPlazo())).propuesta.enviar(datos(c))).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect((await crearCaller(null, dentroDelPlazo())).propuesta.enviar(datos(c))).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(await db.propuesta.count()).toBe(0);
  });

  it("(g) congreso inexistente → NOT_FOUND", async () => {
    const c = await congresoConPlazo();
    const api = await crearCaller((await crearUsuario(["PONENTE"])).id, dentroDelPlazo());
    await expect(api.propuesta.enviar({ ...datos(c), congresoId: "no-existe" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("(h) FR-009 / clarify P2: sin límite de propuestas por ponente", async () => {
    const c = await congresoConPlazo();
    const api = await crearCaller((await crearUsuario(["PONENTE"])).id, dentroDelPlazo());
    for (let i = 0; i < 4; i++) await api.propuesta.enviar({ ...datos(c), titulo: `Propuesta número ${i + 1}` });
    expect(await db.propuesta.count()).toBe(4);
  });

  it("(i) FR-008 / clarify P1: no existen operaciones para editar ni retirar", async () => {
    // El caller de tRPC es un proxy: se inspecciona la definición real del router
    const procedimientos = Object.keys(appRouter._def.procedures).filter((k) => k.startsWith("propuesta."));
    expect(procedimientos.sort()).toEqual(["propuesta.enviar", "propuesta.mias"]);
  });

  it("(j) el autor es siempre el usuario de la sesión aunque se envíe otro autorId", async () => {
    const c = await congresoConPlazo();
    const ponente = await crearUsuario(["PONENTE"]);
    const otro = await crearUsuario(["PONENTE"]);
    const api = await crearCaller(ponente.id, dentroDelPlazo());
    const r = await api.propuesta.enviar({ ...datos(c), autorId: otro.id } as ReturnType<typeof datos>);
    expect((await db.propuesta.findUniqueOrThrow({ where: { id: r.id } })).autorId).toBe(ponente.id);
  });
});
