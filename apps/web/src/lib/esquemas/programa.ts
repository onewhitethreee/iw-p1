import { z } from "zod";

/** spec-003 · contracts/programa.md. Horas locales en la zona del congreso (clarify P2), mismo día (P3). */
const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indica el día con formato AAAA-MM-DD");
const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Indica la hora con formato HH:mm");

export const horarioSchema = z.object({ dia, horaInicio: hora, horaFin: hora });

export const programarSchema = horarioSchema.extend({
  propuestaId: z.string().min(1),
  salaId: z.string().min(1, "Elige una sala"),
});

export const moverSchema = z
  .object({
    sesionId: z.string().min(1),
    salaId: z.string().min(1).optional(),
    dia: dia.optional(),
    horaInicio: hora.optional(),
    horaFin: hora.optional(),
  })
  .refine((v) => [v.dia, v.horaInicio, v.horaFin].every((x) => x === undefined) || [v.dia, v.horaInicio, v.horaFin].every((x) => x !== undefined), {
    message: "Indica día, hora de inicio y hora de fin juntos",
  })
  .refine((v) => v.salaId !== undefined || v.dia !== undefined, { message: "No hay nada que cambiar" });

export type ProgramarInput = z.infer<typeof programarSchema>;
export type MoverInput = z.infer<typeof moverSchema>;
