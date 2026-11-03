import { describe, expect, it } from "vitest";
import { estadoTrasAsignar, puedeDecidir, MIN_EVALUACIONES } from "../src/propuesta";

describe("transiciones de propuesta (A1)", () => {
  it("la primera asignación pasa ENVIADA → EN_EVALUACION", () => {
    expect(estadoTrasAsignar("ENVIADA")).toBe("EN_EVALUACION");
  });
  it("asignar más evaluadores mantiene EN_EVALUACION", () => {
    expect(estadoTrasAsignar("EN_EVALUACION")).toBe("EN_EVALUACION");
  });
  it("no se puede asignar una propuesta decidida", () => {
    expect(() => estadoTrasAsignar("ACEPTADA")).toThrow();
    expect(() => estadoTrasAsignar("RECHAZADA")).toThrow();
  });
  it("el mínimo de evaluaciones es 2", () => {
    expect(MIN_EVALUACIONES).toBe(2);
  });
  it("decidir exige EN_EVALUACION y ≥ 2 evaluaciones", () => {
    expect(puedeDecidir("EN_EVALUACION", 2)).toEqual({ ok: true });
    expect(puedeDecidir("EN_EVALUACION", 1)).toEqual({
      ok: false,
      motivo: "Se necesitan al menos 2 evaluaciones (tiene 1)",
    });
    expect(puedeDecidir("ACEPTADA", 3).ok).toBe(false);
    expect(puedeDecidir("ENVIADA", 0).ok).toBe(false);
  });
});
