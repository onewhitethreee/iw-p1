import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";
import { asignarDirecto, escenario } from "./fixtures";

const COMENT = "Revisión completa de la propuesta.";

describe("evaluacion · decidir (spec-002 US3)", () => {
  it("(a) US3-1: con 2 evaluaciones se acepta o se rechaza y se fija decididaEn", async () => {
    for (const [decision, estado] of [["ACEPTAR", "ACEPTADA"], ["RECHAZAR", "RECHAZADA"]] as const) {
      const e = await escenario();
      await asignarDirecto(e.propuesta.id, e.comite[0].id, 8);
      await asignarDirecto(e.propuesta.id, e.comite[1].id, 9);
      expect(await (await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision })).toEqual({ estado });
      const p = await db.propuesta.findUniqueOrThrow({ where: { id: e.propuesta.id } });
      expect(p.estado).toBe(estado);
      expect(p.decididaEn).not.toBeNull();
    }
  });

  it("(b) US3-2: con 1 evaluación se rechaza indicando cuántas tiene", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[0].id, 8);
    await asignarDirecto(e.propuesta.id, e.comite[1].id);
    await expect((await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Se necesitan al menos 2 evaluaciones (tiene 1)",
    });
  });

  it("(c) US3-3: una propuesta decidida no se vuelve a decidir", async () => {
    const e = await escenario("RECHAZADA");
    await expect((await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "La propuesta ya está decidida",
    });
  });

  it("(d) ENVIADA sin evaluadores → CONFLICT", async () => {
    const e = await escenario();
    await expect((await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("(e) US3-5 / clarify P2: media 4,5 se puede aceptar", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[0].id, 4);
    await asignarDirecto(e.propuesta.id, e.comite[1].id, 5);
    expect(await (await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" })).toEqual({ estado: "ACEPTADA" });
  });

  it("(f) dos decisiones simultáneas: exactamente una se aplica", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[0].id, 8);
    await asignarDirecto(e.propuesta.id, e.comite[1].id, 8);
    const api = await crearCaller(e.organizador.id);
    const r = await Promise.allSettled([
      api.evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" }),
      api.evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "RECHAZAR" }),
    ]);
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
  });

  it("(f2) analyze U1: evaluar ∥ decidir nunca deja una evaluación modificada después de la decisión", async () => {
    for (let i = 0; i < 5; i++) {
      const e = await escenario();
      await asignarDirecto(e.propuesta.id, e.comite[0].id, 8);
      await asignarDirecto(e.propuesta.id, e.comite[1].id, 8);
      const a = await db.asignacion.findFirstOrThrow({ where: { propuestaId: e.propuesta.id, evaluadorId: e.comite[0].id } });
      const [, ev] = await Promise.allSettled([
        (await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" }),
        (await crearCaller(e.comite[0].id)).evaluacion.evaluar({ asignacionId: a.id, puntuacion: 2, comentarios: COMENT }),
      ]);
      const p = await db.propuesta.findUniqueOrThrow({ where: { id: e.propuesta.id } });
      const evaluacion = await db.evaluacion.findUniqueOrThrow({ where: { asignacionId: a.id } });
      expect(p.estado).toBe("ACEPTADA");
      expect(evaluacion.updatedAt.getTime()).toBeLessThanOrEqual(p.decididaEn!.getTime());
      if (ev.status === "rejected") expect(ev.reason).toMatchObject({ message: "La propuesta ya está decidida" });
    }
  });

  it("(g) quien no es organizador no puede decidir", async () => {
    const e = await escenario();
    await expect((await crearCaller(e.comite[0].id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "ACEPTAR" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("(h) con 3 asignados y 2 evaluaciones ya se puede decidir", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[0].id, 7);
    await asignarDirecto(e.propuesta.id, e.comite[1].id, 6);
    await asignarDirecto(e.propuesta.id, e.comite[2].id);
    expect(await (await crearCaller(e.organizador.id)).evaluacion.decidir({ propuestaId: e.propuesta.id, decision: "RECHAZAR" })).toEqual({ estado: "RECHAZADA" });
  });

  it("(i) resumenOrganizador expone autor, número de evaluaciones y media", async () => {
    const e = await escenario();
    await asignarDirecto(e.propuesta.id, e.comite[0].id, 7);
    await asignarDirecto(e.propuesta.id, e.comite[1].id, 8);
    await asignarDirecto(e.propuesta.id, e.comite[2].id);
    const [p] = await (await crearCaller(e.organizador.id)).evaluacion.resumenOrganizador({ congresoId: e.congreso.id });
    expect(p).toMatchObject({ titulo: "Propuesta de prueba", autor: { nombre: "Autora Secreta" }, nEvaluaciones: 2, media: 7.5 });
    expect(p!.evaluadores.filter((x) => x.evaluada)).toHaveLength(2);
  });
});
