export type FaseCongreso = "LLAMADA_ABIERTA" | "EN_PREPARACION" | "EN_CURSO" | "FINALIZADO";
export type EstadoPlazo = "NO_ABIERTO" | "ABIERTO" | "CERRADO";

export interface FechasCongreso {
  envioAbre: Date;
  envioCierra: Date;
  inicio: Date;
  fin: Date;
}

export const ETIQUETA_FASE: Record<FaseCongreso, string> = {
  LLAMADA_ABIERTA: "Llamada a comunicaciones abierta",
  EN_PREPARACION: "En preparación",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
};

/** Plazo de envío de propuestas: intervalo [envioAbre, envioCierra). */
export function plazoEnvio(c: Pick<FechasCongreso, "envioAbre" | "envioCierra">, ahora: Date): EstadoPlazo {
  const t = ahora.getTime();
  if (t < c.envioAbre.getTime()) return "NO_ABIERTO";
  if (t >= c.envioCierra.getTime()) return "CERRADO";
  return "ABIERTO";
}

/** Fase calculada a partir de las fechas (000-core FR-007). */
export function faseCongreso(c: FechasCongreso, ahora: Date): FaseCongreso {
  const t = ahora.getTime();
  if (t >= c.fin.getTime()) return "FINALIZADO";
  if (t >= c.inicio.getTime()) return "EN_CURSO";
  if (plazoEnvio(c, ahora) === "ABIERTO") return "LLAMADA_ABIERTA";
  return "EN_PREPARACION";
}

export function congresoFinalizado(c: Pick<FechasCongreso, "fin">, ahora: Date): boolean {
  return ahora.getTime() >= c.fin.getTime();
}
