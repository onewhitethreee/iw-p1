import { describe, expect, it } from "vitest";
import { nivelOcupacion } from "../src/ocupacion";

describe("nivelOcupacion (spec-008 P1)", () => {
  it("usa la mayor entre reservas y asistencias", () => {
    expect(nivelOcupacion(0, 2, 2)).toEqual({ porcentaje: 100, nivel: "COMPLETA" });
    expect(nivelOcupacion(2, 1, 2)).toEqual({ porcentaje: 100, nivel: "COMPLETA" });
  });
  it("casi completa desde el 90 % exacto, sin redondeo", () => {
    expect(nivelOcupacion(9, 0, 10)).toEqual({ porcentaje: 90, nivel: "CASI_COMPLETA" });
    expect(nivelOcupacion(89, 0, 100)).toEqual({ porcentaje: 89, nivel: null });
    expect(nivelOcupacion(0, 899, 1000)).toEqual({ porcentaje: 89, nivel: null });
  });
  it("porcentaje truncado; por encima del aforo sigue siendo completa", () => {
    expect(nivelOcupacion(1, 0, 3)).toEqual({ porcentaje: 33, nivel: null });
    expect(nivelOcupacion(3, 0, 2)).toEqual({ porcentaje: 150, nivel: "COMPLETA" });
    expect(nivelOcupacion(0, 0, 200)).toEqual({ porcentaje: 0, nivel: null });
  });
});
