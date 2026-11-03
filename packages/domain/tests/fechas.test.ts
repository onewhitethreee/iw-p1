import { describe, expect, it } from "vitest";
import { diaLocal, finDeDia, inicioDeDia, inicioDelDiaSiguiente } from "../src/fechas";

const Z = "Europe/Madrid";

describe("días completos en la zona del congreso (clarify P1, FR-005a)", () => {
  it("inicioDeDia en horario de verano (UTC+2)", () => {
    expect(inicioDeDia("2026-07-15", Z).toISOString()).toBe("2026-07-14T22:00:00.000Z");
  });
  it("inicioDeDia en horario de invierno (UTC+1)", () => {
    expect(inicioDeDia("2026-01-15", Z).toISOString()).toBe("2026-01-14T23:00:00.000Z");
  });
  it("finDeDia es las 23:59:59.999 locales", () => {
    expect(finDeDia("2026-10-04", Z).toISOString()).toBe("2026-10-04T21:59:59.999Z");
    expect(finDeDia("2026-12-31", Z).toISOString()).toBe("2026-12-31T22:59:59.999Z");
  });
  it("inicioDelDiaSiguiente cruza el cambio de hora de octubre (día de 25 h)", () => {
    // 25/10/2026: se atrasa la hora en Europa
    expect(inicioDelDiaSiguiente("2026-10-25", Z).toISOString()).toBe("2026-10-25T23:00:00.000Z");
    expect(inicioDeDia("2026-10-25", Z).toISOString()).toBe("2026-10-24T22:00:00.000Z");
  });
  it("diaLocal devuelve el día del calendario en la zona", () => {
    expect(diaLocal(new Date("2026-10-04T22:30:00Z"), Z)).toBe("2026-10-05");
    expect(diaLocal(new Date("2026-10-04T21:59:59Z"), Z)).toBe("2026-10-04");
  });
  it("rechaza días mal formados", () => {
    expect(() => inicioDeDia("4/10/2026", Z)).toThrow();
  });
});
