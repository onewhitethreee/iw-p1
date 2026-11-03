import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";
import { ANTES, DIA1, DIA2, escenario } from "./fixtures";

const h = (dia: string, horaInicio: string, horaFin: string) => ({ dia, horaInicio, horaFin });

describe("programa.publicar / publico / sesionPublica (spec-003 US3)", () => {
  it("(a) US3-1: publicar fija PUBLICADO y publicadoEn; es idempotente; solo organizador", async () => {
    const e = await escenario();
    const api = await crearCaller(e.organizador.id, ANTES);
    const r1 = await api.programa.publicar({ congresoId: e.congreso.id });
    expect(r1.estadoPrograma).toBe("PUBLICADO");
    expect(r1.publicadoEn?.toISOString()).toBe(ANTES.toISOString());
    const r2 = await (await crearCaller(e.organizador.id, new Date("2027-03-02T10:00:00Z"))).programa.publicar({ congresoId: e.congreso.id });
    expect(r2.publicadoEn?.toISOString()).toBe(ANTES.toISOString());
    await expect((await crearCaller((await crearUsuario(["PONENTE"])).id)).programa.publicar({ congresoId: e.congreso.id })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("(b) US3-2: en borrador el público no ve sesiones", async () => {
    const e = await escenario();
    await (await crearCaller(e.organizador.id, ANTES)).programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    const r = await (await crearCaller(null)).programa.publico({ slug: e.congreso.slug });
    expect(r.publicado).toBe(false);
    expect(r).not.toHaveProperty("dias");
  });

  it("(c)(e) US3-1: publicado → sesiones por día local y hora, sin datos privados, sin iniciar sesión", async () => {
    const e = await escenario();
    const org = await crearCaller(e.organizador.id, ANTES);
    await org.programa.programar({ propuestaId: e.b1.id, salaId: e.sala("Media").id, ...h(DIA2, "09:00", "09:30") });
    await org.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "11:00", "11:30") });
    await org.programa.programar({ propuestaId: e.a2.id, salaId: e.sala("Grande").id, ...h(DIA1, "09:00", "09:30") });
    await org.programa.publicar({ congresoId: e.congreso.id });
    const r = await (await crearCaller(null)).programa.publico({ slug: e.congreso.slug });
    if (!r.publicado) throw new Error("debería estar publicado");
    expect(r.dias.map((d) => d.dia)).toEqual([DIA1, DIA2]);
    expect(r.dias[0]!.sesiones.map((s) => s.titulo)).toEqual(["A2 de Ana", "A1 de Ana"]);
    expect(r.dias[0]!.sesiones[0]).toMatchObject({ sala: "Grande", area: "Área", ponente: e.autorA.nombre });
    const texto = JSON.stringify(r);
    expect(texto).not.toContain(e.autorA.email);
    expect(texto).not.toMatch(/reservas|asistencias|autorId/);
  });

  it("(d) US3-5: detalle público de una sesión; NOT_FOUND en borrador u otro congreso", async () => {
    const e = await escenario();
    const otro = await escenario();
    const org = await crearCaller(e.organizador.id, ANTES);
    const { id } = await org.programa.programar({ propuestaId: e.a1.id, salaId: e.sala("Grande").id, ...h(DIA1, "10:00", "10:30") });
    const pub = await crearCaller(null);
    await expect(pub.programa.sesionPublica({ slug: e.congreso.slug, sesionId: id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await org.programa.publicar({ congresoId: e.congreso.id });
    const s = await pub.programa.sesionPublica({ slug: e.congreso.slug, sesionId: id });
    expect(s).toMatchObject({ titulo: "A1 de Ana", ponente: e.autorA.nombre, sala: "Grande", resumen: "r".repeat(120) });
    await expect(pub.programa.sesionPublica({ slug: otro.congreso.slug, sesionId: id })).rejects.toMatchObject({ code: "NOT_FOUND" });
    void db;
  });
});
