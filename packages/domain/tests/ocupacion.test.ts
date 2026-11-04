import { describe, expect, it } from "vitest";
import { MARGEN_RESERVA_MIN, nivelOcupacion, reservaVigente } from "../src/ocupacion";

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

describe("reservaVigente (spec-005 FR-010, clarify-2 P2)", () => {
  const inicio = new Date("2027-04-20T08:00:00Z");
  const mas = (ms: number) => new Date(inicio.getTime() + ms);
  it("la reserva garantiza la plaza hasta 10 min después del inicio, sin incluir el minuto 10", () => {
    expect(MARGEN_RESERVA_MIN).toBe(10);
    expect(reservaVigente(inicio, mas(-30 * 60_000))).toBe(true); // antes del inicio
    expect(reservaVigente(inicio, mas(0))).toBe(true);
    expect(reservaVigente(inicio, mas(10 * 60_000 - 1))).toBe(true);
    expect(reservaVigente(inicio, mas(10 * 60_000))).toBe(false);
    expect(reservaVigente(inicio, mas(45 * 60_000))).toBe(false);
  });
});
