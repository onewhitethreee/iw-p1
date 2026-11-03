import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";

const datos = { nombre: "Ana Asistente", email: "Ana@Ejemplo.es", password: "secreta123", rol: "ASISTENTE" as const };

describe("auth.registrar (000-core US1)", () => {
  it("crea la cuenta con el rol elegido, correo en minúsculas y contraseña cifrada", async () => {
    const api = await crearCaller();
    const u = await api.auth.registrar(datos);
    const enBd = await db.usuario.findUniqueOrThrow({ where: { id: u.id }, include: { roles: true } });
    expect(enBd.email).toBe("ana@ejemplo.es");
    expect(enBd.roles.map((r) => r.rol)).toEqual(["ASISTENTE"]);
    expect(await bcrypt.compare("secreta123", enBd.passwordHash)).toBe(true);
    expect(u).not.toHaveProperty("passwordHash");
  });

  it("rechaza un correo ya registrado (escenario 2)", async () => {
    const api = await crearCaller();
    await api.auth.registrar(datos);
    await expect(api.auth.registrar({ ...datos, email: "ana@ejemplo.es" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Ya existe una cuenta con ese correo",
    });
  });

  it("rechaza contraseñas de menos de 8 caracteres", async () => {
    const api = await crearCaller();
    await expect(api.auth.registrar({ ...datos, password: "corta" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("no permite registrarse como organizador, comité ni acreditación (FR-003)", async () => {
    const api = await crearCaller();
    for (const rol of ["ORGANIZADOR", "COMITE", "ACREDITACION"]) {
      await expect(api.auth.registrar({ ...datos, rol: rol as "ASISTENTE" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(await db.usuario.count()).toBe(0);
  });
});
