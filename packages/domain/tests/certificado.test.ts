import { describe, expect, it } from "vitest";
import { cumpleUmbral, horasCertificadas, porcentajeAsistencia, UMBRAL_CERTIFICADO } from "../src/certificado";

describe("certificado (80 %)", () => {
  it("el umbral es 80", () => expect(UMBRAL_CERTIFICADO).toBe(80));
  it("4 de 5 cumple (80 % exacto)", () => {
    expect(porcentajeAsistencia(4, 5)).toBe(80);
    expect(cumpleUmbral(4, 5)).toBe(true);
  });
  it("3 de 5 no cumple", () => expect(cumpleUmbral(3, 5)).toBe(false));
  it("sin redondeo: 79 de 99 (79,8 %) no cumple, 80 de 100 sí", () => {
    expect(cumpleUmbral(79, 99)).toBe(false);
    expect(cumpleUmbral(80, 100)).toBe(true);
  });
  it("agenda vacía no cumple y el porcentaje es 0", () => {
    expect(cumpleUmbral(0, 0)).toBe(false);
    expect(porcentajeAsistencia(0, 0)).toBe(0);
  });
  it("suma la duración en minutos de las sesiones asistidas", () => {
    const s = (a: string, b: string) => ({ inicio: new Date(a), fin: new Date(b) });
    expect(
      horasCertificadas([s("2026-05-10T08:00:00Z", "2026-05-10T09:30:00Z"), s("2026-05-10T10:00:00Z", "2026-05-10T10:45:00Z")]),
    ).toEqual({ minutos: 135, texto: "2 h 15 min" });
  });
});
