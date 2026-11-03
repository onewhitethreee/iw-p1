import { describe, expect, it } from "vitest";
import { calcularTarifa } from "../src/tarifa";

const tarifa = { importeTempranoCent: 9000, importeGeneralCent: 12000 };
const limite = new Date("2026-04-01T21:59:59Z");

describe("calcularTarifa (A4)", () => {
  it("aplica la tarifa temprana hasta la fecha límite incluida", () => {
    expect(calcularTarifa(tarifa, limite, limite)).toEqual({ tarifaAplicada: "TEMPRANA", importeCent: 9000 });
  });
  it("aplica la tarifa general después de la fecha límite", () => {
    expect(calcularTarifa(tarifa, limite, new Date(limite.getTime() + 1000))).toEqual({
      tarifaAplicada: "GENERAL",
      importeCent: 12000,
    });
  });
});
