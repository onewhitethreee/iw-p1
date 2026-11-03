import type { Intervalo } from "./intervalos";

/** Porcentaje mínimo de asistencia sobre la agenda para obtener el certificado. */
export const UMBRAL_CERTIFICADO = 80;

/** Porcentaje (para mostrar), redondeado a 1 decimal. Agenda vacía → 0. */
export function porcentajeAsistencia(asistidas: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((asistidas * 1000) / total) / 10;
}

/** Comparación exacta, sin redondeo: asistidas × 100 ≥ 80 × total. Agenda vacía no cumple. */
export function cumpleUmbral(asistidas: number, total: number): boolean {
  if (total === 0) return false;
  return asistidas * 100 >= UMBRAL_CERTIFICADO * total;
}

export function horasCertificadas(sesiones: readonly Intervalo[]): { minutos: number; texto: string } {
  const minutos = sesiones.reduce((acc, s) => acc + Math.round((s.fin.getTime() - s.inicio.getTime()) / 60000), 0);
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const texto = m === 0 ? `${h} h` : h === 0 ? `${m} min` : `${h} h ${m} min`;
  return { minutos, texto };
}
