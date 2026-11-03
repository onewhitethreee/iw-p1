import { z } from "zod";

/** spec-001 FR-001 · contracts/propuesta.md. Compartido por el formulario y `propuesta.enviar`. */
export const TITULO_MIN = 5;
export const TITULO_MAX = 200;
export const RESUMEN_MIN = 100;
export const RESUMEN_MAX = 3000;

export const propuestaSchema = z.object({
  congresoId: z.string().min(1, "Elige un congreso"),
  areaId: z.string().min(1, "Elige un área temática"),
  titulo: z
    .string()
    .trim()
    .min(TITULO_MIN, `El título debe tener entre ${TITULO_MIN} y ${TITULO_MAX} caracteres`)
    .max(TITULO_MAX, `El título debe tener entre ${TITULO_MIN} y ${TITULO_MAX} caracteres`),
  resumen: z
    .string()
    .trim()
    .min(RESUMEN_MIN, `El resumen debe tener entre ${RESUMEN_MIN} y ${RESUMEN_MAX} caracteres`)
    .max(RESUMEN_MAX, `El resumen debe tener entre ${RESUMEN_MIN} y ${RESUMEN_MAX} caracteres`),
});

export type PropuestaInput = z.infer<typeof propuestaSchema>;
