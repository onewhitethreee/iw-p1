import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { crearCaller, crearUsuario } from "../helpers";
import { escenario } from "./fixtures";

describe("evaluacion · asignar (spec-002 US2)", () => {
  it("(a) US2-1: la primera asignación pasa a EN_EVALUACION; la segunda la mantiene", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id);
    expect(await api.evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.comite[0].id })).toEqual({ estado: "EN_EVALUACION" });
    expect(await api.evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.comite[1].id })).toEqual({ estado: "EN_EVALUACION" });
    expect(await db.asignacion.count({ where: { propuestaId: e.propuesta.id } })).toBe(2);
    const r = await (await crearCaller(e.comite[0].id)).evaluacion.misAsignaciones({});
    expect(r).toHaveLength(1);
  });

  it("(b) US2-2: no se asigna al autor aunque tenga rol COMITE", async () => {
    const e = await escenario();
    await db.usuarioRol.create({ data: { usuarioId: e.autora.id, rol: "COMITE" } });
    await expect((await crearCaller(e.organizador.id)).evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.autora.id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Un evaluador no puede evaluar su propia propuesta",
    });
    expect((await db.propuesta.findUniqueOrThrow({ where: { id: e.propuesta.id } })).estado).toBe("ENVIADA");
  });

  it("(c) US2-3: no se repite evaluador", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id);
    await api.evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.comite[0].id });
    await expect(api.evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.comite[0].id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Ese evaluador ya tiene asignada esta propuesta",
    });
  });

  it("(d) US2-4: usuario sin rol COMITE → BAD_REQUEST", async () => {
    const e = await escenario();
    const asistente = await crearUsuario(["ASISTENTE"]);
    await expect((await crearCaller(e.organizador.id)).evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: asistente.id })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "El usuario no pertenece al comité científico",
    });
  });

  it("(e) US2-5: quien no es organizador no puede asignar", async () => {
    const e = await escenario();
    await expect((await crearCaller(e.comite[0].id)).evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.comite[1].id })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("(f) propuesta decidida → CONFLICT; inexistente → NOT_FOUND", async () => {
    const e = await escenario("ACEPTADA");
    const api = await crearCaller(e.organizador.id);
    await expect(api.evaluacion.asignar({ propuestaId: e.propuesta.id, evaluadorId: e.comite[0].id })).rejects.toMatchObject({ code: "CONFLICT", message: "La propuesta ya está decidida" });
    await expect(api.evaluacion.asignar({ propuestaId: "no-existe", evaluadorId: e.comite[0].id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("(g) FR-010 / clarify P1: no existe operación para quitar asignaciones", () => {
    const procs = Object.keys(appRouter._def.procedures).filter((k) => k.startsWith("evaluacion."));
    expect(procs.sort()).toEqual(
      ["asignar", "decidir", "detalle", "evaluar", "miembrosComite", "misAsignaciones", "resumenOrganizador"].map((p) => `evaluacion.${p}`).sort(),
    );
  });

  it("(h) miembrosComite lista solo usuarios con rol COMITE", async () => {
    const e = await escenario();
    const lista = await (await crearCaller(e.organizador.id)).evaluacion.miembrosComite();
    expect(lista.map((u) => u.id).sort()).toEqual(e.comite.map((u) => u.id).sort());
  });
});
