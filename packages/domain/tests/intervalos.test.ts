import { describe, expect, it } from "vitest";
import { primerHueco, solapa, primerSolape } from "../src/intervalos";

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

describe("primerHueco (spec-003 SC-004, converge-3: hora propuesta al programar)", () => {
  const o = (inicio: string, fin: string) => ({ inicio, fin });
  it("sala libre ese día → 09:00–10:00", () => {
    expect(primerHueco([])).toEqual({ horaInicio: "09:00", horaFin: "10:00" });
  });
  it("salta las sesiones ocupadas y usa el primer hueco de 60 min, aunque sea entre dos sesiones", () => {
    expect(primerHueco([o("09:00", "10:30"), o("12:00", "13:00")])).toEqual({ horaInicio: "10:30", horaFin: "11:30" });
    expect(primerHueco([o("12:00", "13:00"), o("09:00", "10:30"), o("10:30", "11:45")])).toEqual({ horaInicio: "13:00", horaFin: "14:00" });
  });
  it("un hueco menor de 60 min no sirve; contiguo (A7) sí", () => {
    expect(primerHueco([o("09:00", "10:00"), o("10:30", "11:00")])).toEqual({ horaInicio: "11:00", horaFin: "12:00" });
    expect(primerHueco([o("10:00", "11:00")])).toEqual({ horaInicio: "09:00", horaFin: "10:00" });
  });
  it("sin hueco antes de medianoche (clarify-2 P3 de spec-003) → null", () => {
    expect(primerHueco([o("09:00", "23:30")])).toBeNull();
  });
});
