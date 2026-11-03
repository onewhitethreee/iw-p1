import { describe, expect, it } from "vitest";
import { euros, fechaHora, hora } from "../src/formato";

describe("formato es-ES", () => {
  it("formatea céntimos en euros", () => {
    expect(euros(125000)).toBe("1250,00 €".replace("1250", "1.250"));
    expect(euros(9000)).toBe("90,00 €");
    expect(euros(0)).toBe("0,00 €");
  });
  it("muestra la hora en la zona del congreso", () => {
    const d = new Date("2026-05-10T08:30:00Z"); // 10:30 en Madrid (horario de verano)
    expect(hora(d, "Europe/Madrid")).toBe("10:30");
    expect(fechaHora(d, "Europe/Madrid")).toContain("10:30");
  });
});
