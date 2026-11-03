/** Nivel de ocupación de una sesión en el panel (spec-008 clarify P1). */
export type NivelOcupacion = "COMPLETA" | "CASI_COMPLETA" | null;

/** Umbral de «Casi completa», en porcentaje del aforo. */
export const UMBRAL_CASI_COMPLETA = 90;

/**
 * Ocupación = la mayor entre reservas y asistencias, sobre el aforo de la sala.
 * Porcentaje truncado para mostrar; el nivel se decide con comparación exacta.
 */
export function nivelOcupacion(reservas: number, asistencias: number, aforo: number): { porcentaje: number; nivel: NivelOcupacion } {
  const ocupadas = Math.max(reservas, asistencias);
  const porcentaje = aforo > 0 ? Math.floor((ocupadas * 100) / aforo) : 0;
  const nivel: NivelOcupacion = ocupadas >= aforo ? "COMPLETA" : ocupadas * 100 >= UMBRAL_CASI_COMPLETA * aforo ? "CASI_COMPLETA" : null;
  return { porcentaje, nivel };
}
