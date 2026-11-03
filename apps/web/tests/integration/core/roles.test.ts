import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";

describe("control de roles en el servidor (000-core FR-004, SC-001)", () => {
  it("sin sesión, un procedimiento protegido devuelve UNAUTHORIZED", async () => {
    const api = await crearCaller(null);
    await expect(api.auth.yo()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("un asistente no puede ejecutar una operación de organizador (escenario 3)", async () => {
    const asistente = await crearUsuario(["ASISTENTE"]);
    const api = await crearCaller(asistente.id);
    await expect(api.auth.asignarRol({ usuarioId: asistente.id, rol: "ORGANIZADOR" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    const roles = await db.usuarioRol.findMany({ where: { usuarioId: asistente.id } });
    expect(roles.map((r) => r.rol)).toEqual(["ASISTENTE"]);
  });

  it("un usuario con varios roles los tiene todos (escenario 4)", async () => {
    const u = await crearUsuario(["PONENTE", "COMITE"]);
    const api = await crearCaller(u.id);
    expect((await api.auth.yo()).roles.sort()).toEqual(["COMITE", "PONENTE"]);
  });

  it("un organizador puede asignar roles", async () => {
    const org = await crearUsuario(["ORGANIZADOR"]);
    const u = await crearUsuario(["PONENTE"]);
    const api = await crearCaller(org.id);
    await api.auth.asignarRol({ usuarioId: u.id, rol: "COMITE" });
    const roles = await db.usuarioRol.findMany({ where: { usuarioId: u.id } });
    expect(roles.map((r) => r.rol).sort()).toEqual(["COMITE", "PONENTE"]);
  });

  it("un rol retirado deja de valer en la siguiente llamada (Edge Case)", async () => {
    const org = await crearUsuario(["ORGANIZADOR"]);
    const otro = await crearUsuario(["PONENTE"]);
    await db.usuarioRol.delete({ where: { usuarioId_rol: { usuarioId: org.id, rol: "ORGANIZADOR" } } });
    const api = await crearCaller(org.id); // el contexto relee los roles de la BD
    await expect(api.auth.asignarRol({ usuarioId: otro.id, rol: "COMITE" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
