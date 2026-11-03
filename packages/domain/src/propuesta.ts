export type EstadoPropuesta = "ENVIADA" | "EN_EVALUACION" | "ACEPTADA" | "RECHAZADA";

/** Acuerdo A1: mínimo de evaluaciones para poder decidir. */
export const MIN_EVALUACIONES = 2;
export const PUNTUACION_MIN = 1;
export const PUNTUACION_MAX = 10;

export const ETIQUETA_ESTADO_PROPUESTA: Record<EstadoPropuesta, string> = {
  ENVIADA: "Enviada",
  EN_EVALUACION: "En evaluación",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
};

export function estaDecidida(e: EstadoPropuesta): boolean {
  return e === "ACEPTADA" || e === "RECHAZADA";
}

/** Estado tras asignar un evaluador. Lanza si la propuesta ya está decidida. */
export function estadoTrasAsignar(e: EstadoPropuesta): EstadoPropuesta {
  if (estaDecidida(e)) throw new Error("La propuesta ya está decidida");
  return "EN_EVALUACION";
}

export type Resultado = { ok: true } | { ok: false; motivo: string };

export function puedeDecidir(e: EstadoPropuesta, numEvaluaciones: number): Resultado {
  if (estaDecidida(e)) return { ok: false, motivo: "La propuesta ya está decidida" };
  if (e !== "EN_EVALUACION") return { ok: false, motivo: "La propuesta todavía no tiene evaluadores asignados" };
  if (numEvaluaciones < MIN_EVALUACIONES)
    return { ok: false, motivo: `Se necesitan al menos ${MIN_EVALUACIONES} evaluaciones (tiene ${numEvaluaciones})` };
  return { ok: true };
}
