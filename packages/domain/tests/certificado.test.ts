import { describe, expect, it } from "vitest";
import { cumpleUmbral, horasCertificadas, porcentajeAsistencia, recuentoPorTurnos, UMBRAL_CERTIFICADO } from "../src/certificado";

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
  it("clarify P2 (spec-007): el porcentaje se muestra truncado a entero", () => {
    expect(porcentajeAsistencia(2, 3)).toBe(66);
    expect(porcentajeAsistencia(7, 9)).toBe(77);
    expect(porcentajeAsistencia(799, 1000)).toBe(79); // 79,9 % nunca se muestra como 80
    expect(porcentajeAsistencia(5, 5)).toBe(100);
  });
  it("suma la duración en minutos de las sesiones asistidas", () => {
    const s = (a: string, b: string) => ({ inicio: new Date(a), fin: new Date(b) });
    expect(
      horasCertificadas([s("2026-05-10T08:00:00Z", "2026-05-10T09:30:00Z"), s("2026-05-10T10:00:00Z", "2026-05-10T10:45:00Z")]),
    ).toEqual({ minutos: 135, texto: "2 h 15 min" });
  });
});

describe("recuentoPorTurnos (spec-007 FR-002, clarify-2 P3)", () => {
  const h = (hh: number, mm = 0) => new Date(Date.UTC(2027, 4, 10, hh, mm));
  const s = (ini: number, fin: number, asistida: boolean) => ({ inicio: h(ini), fin: h(fin), asistida });
  it("sin solapes, cada sesión es un turno (mismo resultado que antes)", () => {
    expect(recuentoPorTurnos([s(8, 9, true), s(10, 11, false), s(12, 13, true)])).toEqual({ asistidas: 2, total: 3 });
  });
  it("dos sesiones solapadas cuentan como una; asistida si fue a cualquiera de ellas", () => {
    expect(recuentoPorTurnos([s(8, 9, true), s(10, 11, false), { inicio: h(10, 30), fin: h(11, 30), asistida: true }])).toEqual({ asistidas: 2, total: 2 });
    expect(recuentoPorTurnos([s(10, 11, false), { inicio: h(10, 30), fin: h(11, 30), asistida: false }])).toEqual({ asistidas: 0, total: 1 });
  });
  it("una cadena A–B–C (A y C no se tocan) es un solo turno; el orden de entrada no importa", () => {
    const cadena = [{ inicio: h(11), fin: h(13), asistida: false }, s(8, 10, false), { inicio: h(9, 30), fin: h(11, 30), asistida: true }];
    expect(recuentoPorTurnos(cadena)).toEqual({ asistidas: 1, total: 1 });
  });
  it("las contiguas (una empieza cuando acaba la otra, A7) son turnos distintos", () => {
    expect(recuentoPorTurnos([s(8, 9, true), s(9, 10, false)])).toEqual({ asistidas: 1, total: 2 });
  });
  it("agenda vacía → 0 de 0", () => {
    expect(recuentoPorTurnos([])).toEqual({ asistidas: 0, total: 0 });
  });
});
