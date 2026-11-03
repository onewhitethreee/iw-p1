import { describe, expect, it } from "vitest";
import { faseCongreso, plazoEnvio } from "../src/congreso";

const c = {
  envioAbre: new Date("2026-01-01T00:00:00Z"),
  envioCierra: new Date("2026-03-01T00:00:00Z"),
  inicio: new Date("2026-05-10T07:00:00Z"),
  fin: new Date("2026-05-12T18:00:00Z"),
};

describe("faseCongreso", () => {
  it("LLAMADA_ABIERTA dentro del plazo de envío", () => {
    expect(faseCongreso(c, new Date("2026-02-01T00:00:00Z"))).toBe("LLAMADA_ABIERTA");
  });
  it("EN_PREPARACION antes de abrir y entre cierre e inicio", () => {
    expect(faseCongreso(c, new Date("2025-12-31T00:00:00Z"))).toBe("EN_PREPARACION");
    expect(faseCongreso(c, new Date("2026-03-01T00:00:00Z"))).toBe("EN_PREPARACION");
  });
  it("EN_CURSO desde el inicio (incluido) hasta el fin (excluido)", () => {
    expect(faseCongreso(c, c.inicio)).toBe("EN_CURSO");
    expect(faseCongreso(c, new Date("2026-05-12T17:59:59Z"))).toBe("EN_CURSO");
  });
  it("FINALIZADO desde el fin", () => {
    expect(faseCongreso(c, c.fin)).toBe("FINALIZADO");
  });
});

describe("plazoEnvio [envioAbre, envioCierra)", () => {
  it("abierto en la apertura exacta", () => {
    expect(plazoEnvio(c, c.envioAbre)).toBe("ABIERTO");
  });
  it("cerrado en el instante de cierre", () => {
    expect(plazoEnvio(c, c.envioCierra)).toBe("CERRADO");
  });
  it("no abierto antes de la apertura", () => {
    expect(plazoEnvio(c, new Date("2025-12-31T23:59:59Z"))).toBe("NO_ABIERTO");
  });
});
