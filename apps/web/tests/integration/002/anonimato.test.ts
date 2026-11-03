import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller } from "../helpers";
import { asignarDirecto, escenario } from "./fixtures";

/** spec-002 SC-001 / FR-005: ninguna respuesta al comité contiene rastro del autor. */
describe("anonimato de la revisión", () => {
  it("misAsignaciones, detalle y evaluar no contienen nombre, correo ni id del autor", async () => {
    const e = await escenario();
    const a = await asignarDirecto(e.propuesta.id, e.comite[0].id);
    const api = await crearCaller(e.comite[0].id);
    const respuestas = [
      await api.evaluacion.misAsignaciones({}),
      await api.evaluacion.misAsignaciones({ congresoId: e.congreso.id }),
      await api.evaluacion.detalle({ asignacionId: a.id }),
      await api.evaluacion.evaluar({ asignacionId: a.id, puntuacion: 8, comentarios: "Muy interesante y aplicable." }),
      await api.evaluacion.detalle({ asignacionId: a.id }),
    ];
    const texto = JSON.stringify(respuestas);
    for (const rastro of [e.autora.nombre, e.autora.email, e.autora.id, "autorId", '"autor"']) {
      expect(texto, `fuga de «${rastro}»`).not.toContain(rastro);
    }
  });

  it("un usuario PONENTE+COMITE nunca ve sus propias propuestas como evaluador", async () => {
    const e = await escenario();
    await db.usuarioRol.create({ data: { usuarioId: e.autora.id, rol: "COMITE" } });
    const otra = await db.propuesta.create({ data: { congresoId: e.congreso.id, areaId: e.area.id, autorId: e.comite[0].id, titulo: "Ajena", resumen: "r".repeat(120) } });
    await asignarDirecto(otra.id, e.autora.id);
    const r = await (await crearCaller(e.autora.id)).evaluacion.misAsignaciones({});
    expect(r.map((x) => x.propuesta.titulo)).toEqual(["Ajena"]);
  });
});
