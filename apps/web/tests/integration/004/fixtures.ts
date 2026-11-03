import { finDeDia, inicioDeDia, inicioDelDiaSiguiente } from "@congresalia/domain";
import { db } from "~/server/db";
import { crearUsuario } from "../helpers";

export const ZONA = "Europe/Madrid";
export const DIA_LIMITE = "2027-03-01";
/** 23:59 del día límite temprano (hora del congreso). */
export const A_2359 = new Date(inicioDelDiaSiguiente(DIA_LIMITE, ZONA).getTime() - 60_000);
/** 00:00 del día siguiente al límite. */
export const A_0000 = inicioDelDiaSiguiente(DIA_LIMITE, ZONA);

let n = 0;
export async function congresoConTarifas() {
  n++;
  return db.congreso.create({
    data: {
      slug: `insc-${n}-${Date.now()}`,
      nombre: `Congreso inscripción ${n}`,
      descripcion: "Prueba",
      sede: "Sede",
      zonaHoraria: ZONA,
      envioAbre: inicioDeDia("2026-12-01", ZONA),
      envioCierra: inicioDelDiaSiguiente("2027-01-31", ZONA),
      limiteTemprana: finDeDia(DIA_LIMITE, ZONA),
      inicio: inicioDeDia("2027-04-20", ZONA),
      fin: finDeDia("2027-04-22", ZONA),
      tarifas: {
        create: [
          { tipoAsistente: "PROFESIONAL", importeTempranoCent: 25000, importeGeneralCent: 30000 },
          { tipoAsistente: "SOCIO", importeTempranoCent: 18000, importeGeneralCent: 22000 },
          { tipoAsistente: "ESTUDIANTE", importeTempranoCent: 9000, importeGeneralCent: 12000 },
        ],
      },
    },
  });
}

export const asistente = () => crearUsuario(["ASISTENTE"]);
