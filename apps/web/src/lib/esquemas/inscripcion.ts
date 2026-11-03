import { z } from "zod";

/** spec-004 FR-002: el cliente nunca envía el importe; solo congreso y tipo. */
export const crearInscripcionSchema = z.object({
  congresoId: z.string().min(1),
  tipoAsistente: z.enum(["PROFESIONAL", "SOCIO", "ESTUDIANTE"], { message: "Elige un tipo de asistente" }),
});

/** spec-004 FR-013 (clarify P3): 16 dígitos, se admiten espacios. */
export const normalizarTarjeta = (t: string) => t.replace(/\s+/g, "");
export const pagoSchema = z.object({
  inscripcionId: z.string().min(1),
  tarjeta: z
    .string()
    .transform(normalizarTarjeta)
    .refine((t) => /^\d{16}$/.test(t), { message: "El número de tarjeta debe tener 16 dígitos" }),
});

export const TARJETA_RECHAZO = "4000000000000002";
