import type { Intervalo } from "./intervalos";

/** Porcentaje mínimo de asistencia sobre la agenda para obtener el certificado. */
export const UMBRAL_CERTIFICADO = 80;

/**
 * Porcentaje para mostrar, truncado a entero hacia abajo (spec-007 clarify P2): nunca enseña «80 %»
 * a quien no llega. La disponibilidad se decide con `cumpleUmbral()`. Agenda vacía → 0.
 */
export function porcentajeAsistencia(asistidas: number, total: number): number {
  if (total === 0) return 0;
  return Math.floor((asistidas * 100) / total);
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

/**
 * spec-007 FR-002 (clarify-2 P3, plan R4): las sesiones de la agenda que se solapan entre sí (A7, directa o
 * encadenadamente) forman un turno, que cuenta una vez y está asistido si lo está cualquiera de sus sesiones.
 * Barrido por inicio: una sesión entra en el turno actual si empieza antes del fin más tardío del turno.
 */
export function recuentoPorTurnos(sesiones: readonly (Intervalo & { asistida: boolean })[]): { asistidas: number; total: number } {
  const orden = [...sesiones].sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  let total = 0;
  let asistidas = 0;
  let finTurno = -Infinity;
  let turnoAsistido = false;
  for (const s of orden) {
    if (s.inicio.getTime() < finTurno) {
      finTurno = Math.max(finTurno, s.fin.getTime());
      turnoAsistido ||= s.asistida;
      continue;
    }
    if (turnoAsistido) asistidas++;
    total++;
    finTurno = s.fin.getTime();
    turnoAsistido = s.asistida;
  }
  if (turnoAsistido) asistidas++;
  return { asistidas, total };
}
