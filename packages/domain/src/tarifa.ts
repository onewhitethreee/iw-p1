export type TipoAsistente = "PROFESIONAL" | "SOCIO" | "ESTUDIANTE";
export type TarifaAplicada = "TEMPRANA" | "GENERAL";

export const ETIQUETA_TIPO_ASISTENTE: Record<TipoAsistente, string> = {
  PROFESIONAL: "Profesional",
  SOCIO: "Socio de la sociedad científica",
  ESTUDIANTE: "Estudiante",
};

export interface ImportesTarifa {
  importeTempranoCent: number;
  importeGeneralCent: number;
}

/** Acuerdo A4: temprana si la fecha de inscripción es ≤ fecha límite temprana. */
export function calcularTarifa(
  tarifa: ImportesTarifa,
  limiteTemprana: Date,
  fechaInscripcion: Date,
): { tarifaAplicada: TarifaAplicada; importeCent: number } {
  return fechaInscripcion.getTime() <= limiteTemprana.getTime()
    ? { tarifaAplicada: "TEMPRANA", importeCent: tarifa.importeTempranoCent }
    : { tarifaAplicada: "GENERAL", importeCent: tarifa.importeGeneralCent };
}
