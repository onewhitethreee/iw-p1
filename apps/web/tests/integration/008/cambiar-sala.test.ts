import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";
import { AHORA, asistir, escenario, FIN_CONGRESO, inscribir, min, reservar } from "./fixtures";

const panel = async (orgId: string, ahora = AHORA) => (await crearCaller(orgId, ahora)).panel;

describe("panel.salasLibres / cambiarSala (US3)", () => {
  it("(a) US3-1 excluye la sala actual, las solapadas y las de aforo < máx(reservas, asistencias); ordenadas por aforo", async () => {
    const e = await escenario();
    // Tarde (Mediana, 300–360): la Grande está libre; la Pequeña también
    let libres = await (await panel(e.org.id)).salasLibres({ sesionId: e.s.tarde.id });
    expect(libres.map((s) => s.nombre)).toEqual(["Pequeña", "Grande"]);
    // 3 reservas → la Pequeña (aforo 2) ya no vale (P2)
    for (let i = 0; i < 3; i++) await reservar((await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA")).id, e.s.tarde.id);
    libres = await (await panel(e.org.id)).salasLibres({ sesionId: e.s.tarde.id });
    expect(libres).toEqual([{ id: e.sala("Grande").id, nombre: "Grande", aforo: 200 }]);
    // Otra sesión en la Grande que solapa → no hay salas libres
    await e.sesion("Ocupa la grande", "Grande", 330, 400);
    expect(await (await panel(e.org.id)).salasLibres({ sesionId: e.s.tarde.id })).toEqual([]);
  });

  it("(a2) P2 también cuenta las asistencias", async () => {
    const e = await escenario();
    for (let i = 0; i < 3; i++) await asistir((await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA")).id, e.s.tarde.id, e.puerta.id);
    const libres = await (await panel(e.org.id)).salasLibres({ sesionId: e.s.tarde.id });
    expect(libres.map((s) => s.nombre)).toEqual(["Grande"]);
  });

  it("(b) US3-2 cambia la sala, conserva reservas y asistencias y el resumen muestra el nuevo aforo", async () => {
    const e = await escenario();
    const a = await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA");
    await reservar(a.id, e.s.enCurso.id);
    await asistir(a.id, e.s.enCurso.id, e.puerta.id);
    const api = await panel(e.org.id);
    const r = await api.cambiarSala({ sesionId: e.s.enCurso.id, salaId: e.sala("Mediana").id });
    expect(r).toEqual({ sesionId: e.s.enCurso.id, sala: "Mediana", aforo: 10 });
    expect((await db.sesion.findUniqueOrThrow({ where: { id: e.s.enCurso.id } })).salaId).toBe(e.sala("Mediana").id);
    const s = (await api.resumen({ congresoId: e.c.id })).sesiones.find((x) => x.id === e.s.enCurso.id)!;
    expect(s).toMatchObject({ sala: "Mediana", aforo: 10, reservas: 1, asistencias: 1 });
  });

  it("(c) US3-3 solape en la sala destino al confirmar → CONFLICT que nombra la sesión y la sesión no cambia", async () => {
    const e = await escenario();
    const api = await panel(e.org.id);
    expect((await api.salasLibres({ sesionId: e.s.tarde.id })).map((s) => s.nombre)).toContain("Grande");
    await e.sesion("Llegó antes", "Grande", 280, 320);
    await expect(api.cambiarSala({ sesionId: e.s.tarde.id, salaId: e.sala("Grande").id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sala «Grande» ya tiene «Llegó antes» de 14:40 a 15:20",
    });
    expect((await db.sesion.findUniqueOrThrow({ where: { id: e.s.tarde.id } })).salaId).toBe(e.sala("Mediana").id);

  });

  it("(c2) concurrencia: dos sesiones solapadas pidiendo a la vez la misma sala libre → una sola lo consigue", async () => {
    const e = await escenario();
    const x = await e.sesion("X", "Pequeña", 600, 660);
    const y = await e.sesion("Y", "Mediana", 630, 690);
    const api = await panel(e.org.id);
    const rs = await Promise.allSettled([
      api.cambiarSala({ sesionId: x.id, salaId: e.sala("Grande").id }),
      api.cambiarSala({ sesionId: y.id, salaId: e.sala("Grande").id }),
    ]);
    expect(rs.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(rs.find((r) => r.status === "rejected")).toMatchObject({ reason: { code: "CONFLICT" } });
    expect(await db.sesion.count({ where: { salaId: e.sala("Grande").id, id: { in: [x.id, y.id] } } })).toBe(1);
  });

  it("(d) aforo insuficiente, misma sala → CONFLICT; sala de otro congreso → NOT_FOUND", async () => {
    const e = await escenario();
    const otro = await escenario();
    for (let i = 0; i < 3; i++) await reservar((await inscribir(e.c.id, "SOCIO", "GENERAL", "CONFIRMADA")).id, e.s.tarde.id);
    const api = await panel(e.org.id);
    await expect(api.cambiarSala({ sesionId: e.s.tarde.id, salaId: e.sala("Pequeña").id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sala «Pequeña» tiene aforo 2 y la sesión ya tiene 3 personas (reservas o asistencias)",
    });
    await expect(api.cambiarSala({ sesionId: e.s.tarde.id, salaId: e.sala("Mediana").id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sesión ya está en esa sala",
    });
    await expect(api.cambiarSala({ sesionId: e.s.tarde.id, salaId: otro.sala("Grande").id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(api.cambiarSala({ sesionId: "no-existe", salaId: e.sala("Grande").id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("(e) US3-4 sesión terminada o congreso finalizado → CONFLICT; empezada y no terminada → permitido (P3)", async () => {
    const e = await escenario();
    const api = await panel(e.org.id);
    await expect(api.cambiarSala({ sesionId: e.s.pasada.id, salaId: e.sala("Mediana").id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La sesión ya ha terminado",
    });
    await expect(api.salasLibres({ sesionId: e.s.pasada.id })).rejects.toMatchObject({ code: "CONFLICT", message: "La sesión ya ha terminado" });
    const fin = await panel(e.org.id, FIN_CONGRESO);
    await expect(fin.cambiarSala({ sesionId: e.s.tarde.id, salaId: e.sala("Grande").id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "El congreso ha finalizado: el programa ya no se puede cambiar",
    });
    // «En curso» empezó a las 10:00 y ahora son las 10:30
    expect(AHORA > min(0)).toBe(true);
    expect((await api.cambiarSala({ sesionId: e.s.enCurso.id, salaId: e.sala("Grande").id })).sala).toBe("Grande");
  });
});
