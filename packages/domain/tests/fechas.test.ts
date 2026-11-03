import { describe, expect, it } from "vitest";
import { diaLocal, finDeDia, inicioDeDia, inicioDelDiaSiguiente, instanteLocal } from "../src/fechas";

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

describe("instanteLocal (spec-003 clarify P2, FR-014)", () => {
  it("10:00 de Madrid en verano es 08:00 UTC", () => {
    expect(instanteLocal("2027-07-01T10:00", Z).toISOString()).toBe("2027-07-01T08:00:00.000Z");
  });
  it("10:00 de Madrid en invierno es 09:00 UTC", () => {
    expect(instanteLocal("2027-01-15T10:00", Z).toISOString()).toBe("2027-01-15T09:00:00.000Z");
  });
  it("00:00 coincide con inicioDeDia", () => {
    expect(instanteLocal("2027-04-20T00:00", Z).getTime()).toBe(inicioDeDia("2027-04-20", Z).getTime());
  });
  it("rechaza formatos no válidos", () => {
    for (const v of ["2027-04-20 10:00", "2027-04-20T25:00", "2027-04-20T10:60", "20-04-2027T10:00"]) {
      expect(() => instanteLocal(v, Z)).toThrow();
    }
  });
});

