import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";

const rolesDe = async (id: string) => (await db.usuarioRol.findMany({ where: { usuarioId: id } })).map((r) => r.rol).sort();

describe("auth.anadirRolPropio (clarify P2, FR-003a)", () => {
  it("un asistente se añade el rol ponente y conserva el de asistente (US1 escenario 5)", async () => {
    const u = await crearUsuario(["ASISTENTE"]);
    const api = await crearCaller(u.id);
    await api.auth.anadirRolPropio({ rol: "PONENTE" });
    expect(await rolesDe(u.id)).toEqual(["ASISTENTE", "PONENTE"]);
  });

  it("es idempotente: añadir un rol que ya tiene no falla ni lo duplica", async () => {
    const u = await crearUsuario(["PONENTE"]);
    const api = await crearCaller(u.id);
    await api.auth.anadirRolPropio({ rol: "PONENTE" });
    expect(await rolesDe(u.id)).toEqual(["PONENTE"]);
  });

  it("rechaza autoasignarse comité, organizador o acreditación y no cambia los roles (US1 escenario 6)", async () => {
    const u = await crearUsuario(["ASISTENTE"]);
    const api = await crearCaller(u.id);
    for (const rol of ["COMITE", "ORGANIZADOR", "ACREDITACION"]) {
      await expect(api.auth.anadirRolPropio({ rol: rol as "PONENTE" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(await rolesDe(u.id)).toEqual(["ASISTENTE"]);
  });

  it("sin sesión devuelve UNAUTHORIZED", async () => {
    const api = await crearCaller(null);
    await expect(api.auth.anadirRolPropio({ rol: "PONENTE" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
