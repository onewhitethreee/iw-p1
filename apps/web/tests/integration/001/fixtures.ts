import { finDeDia, inicioDeDia, inicioDelDiaSiguiente } from "@congresalia/domain";
import { db } from "~/server/db";

export const ZONA = "Europe/Madrid";
export const DIA_APERTURA = "2027-01-10";
export const DIA_CIERRE = "2027-02-15";

/** Congreso con plazo de envío del 10/01/2027 al 15/02/2027 (días completos, FR-005a). */
export async function congresoConPlazo(slug = `c-${Math.random().toString(36).slice(2, 8)}`) {
  const c = await db.congreso.create({
    data: {
      slug,
      nombre: `Congreso ${slug}`,
      descripcion: "Prueba",
      sede: "Sede",
      zonaHoraria: ZONA,
      envioAbre: inicioDeDia(DIA_APERTURA, ZONA),
      envioCierra: inicioDelDiaSiguiente(DIA_CIERRE, ZONA),
      limiteTemprana: finDeDia("2027-03-01", ZONA),
      inicio: inicioDeDia("2027-04-20", ZONA),
      fin: finDeDia("2027-04-22", ZONA),
      areas: { create: [{ nombre: "Área A" }, { nombre: "Área B" }] },
    },
    include: { areas: true },
  });
  return { ...c, area: c.areas[0]! };
}

/** 12:00 (hora del congreso) de un día dentro del plazo. */
export const dentroDelPlazo = () => new Date(inicioDeDia("2027-02-01", ZONA).getTime() + 12 * 3600_000);

export const resumenValido = "Esta comunicación describe la experiencia de un servicio de pediatría con un nuevo protocolo de atención temprana.";
