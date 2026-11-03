import { z } from "zod";
import { PUNTUACION_MAX, PUNTUACION_MIN } from "@congresalia/domain";

/** spec-002 FR-006 · contracts/evaluacion.md. Compartido por el formulario y `evaluacion.evaluar`. */
export const COMENTARIOS_MIN = 10;
export const COMENTARIOS_MAX = 2000;
const MSG_PUNTUACION = `La puntuación debe ser un número entero de ${PUNTUACION_MIN} a ${PUNTUACION_MAX}`;

export const evaluacionSchema = z.object({
  asignacionId: z.string().min(1),
  puntuacion: z.coerce.number({ message: MSG_PUNTUACION }).int(MSG_PUNTUACION).min(PUNTUACION_MIN, MSG_PUNTUACION).max(PUNTUACION_MAX, MSG_PUNTUACION),
  comentarios: z
    .string()
    .trim()
    .min(COMENTARIOS_MIN, `Los comentarios deben tener entre ${COMENTARIOS_MIN} y ${COMENTARIOS_MAX} caracteres`)
    .max(COMENTARIOS_MAX, `Los comentarios deben tener entre ${COMENTARIOS_MIN} y ${COMENTARIOS_MAX} caracteres`),
});

export type EvaluacionInput = z.infer<typeof evaluacionSchema>;
