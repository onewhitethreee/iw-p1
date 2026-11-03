import { describe, expect, it } from "vitest";
import { solapa, primerSolape } from "../src/intervalos";

const h = (hh: number, mm = 0) => new Date(Date.UTC(2026, 10, 3, hh, mm));
const iv = (a: Date, b: Date) => ({ inicio: a, fin: b });

describe("solapa (A7, intervalos semiabiertos)", () => {
  it("detecta solape parcial", () => {
    expect(solapa(iv(h(10), h(10, 30)), iv(h(10, 15), h(10, 45)))).toBe(true);
  });
  it("detecta intervalos idénticos", () => {
    expect(solapa(iv(h(10), h(11)), iv(h(10), h(11)))).toBe(true);
  });
  it("detecta un intervalo contenido en otro", () => {
    expect(solapa(iv(h(9), h(12)), iv(h(10), h(11)))).toBe(true);
  });
  it("los intervalos contiguos NO se solapan", () => {
    expect(solapa(iv(h(10), h(10, 30)), iv(h(10, 30), h(11)))).toBe(false);
    expect(solapa(iv(h(10, 30), h(11)), iv(h(10), h(10, 30)))).toBe(false);
  });
  it("intervalos separados no se solapan", () => {
    expect(solapa(iv(h(9), h(10)), iv(h(11), h(12)))).toBe(false);
  });
  it("primerSolape devuelve el primer elemento en conflicto", () => {
    const otros = [
      { id: "a", ...iv(h(8), h(9)) },
      { id: "b", ...iv(h(10), h(11)) },
    ];
    expect(primerSolape(iv(h(10, 30), h(12)), otros)?.id).toBe("b");
    expect(primerSolape(iv(h(9), h(10)), otros)).toBeUndefined();
  });
});
