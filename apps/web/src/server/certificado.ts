import { cumpleUmbral, fecha, horasCertificadas, porcentajeAsistencia, recuentoPorTurnos } from "@congresalia/domain";
import type { db as Db } from "~/server/db";

/**
 * HU-07: cálculo del certificado de asistencia, compartido por la pantalla (router `certificado`)
 * y por la descarga del PDF, que así vuelve a comprobarlo todo (FR-005, plan R1).
 */

export type EstadoCert = "DISPONIBLE" | "NO_FINALIZADO" | "AGENDA_VACIA" | "BAJO_UMBRAL" | "SIN_INSCRIPCION";

export interface SesionCertificado {
  id: string;
  titulo: string;
  sala: string;
  inicio: Date;
  fin: Date;
  asistida: boolean;
}

export interface EstadoCertificado {
  estado: EstadoCert;
  disponible: boolean;
  motivo: string;
  porcentaje: number;
  asistidas: number;
  total: number;
  horas: { minutos: number; texto: string };
  sesiones: SesionCertificado[];
  congreso: { id: string; slug: string; nombre: string; sede: string; inicio: Date; fin: Date; zonaHoraria: string };
  titular: string | null;
}

/**
 * Estado del certificado del usuario en el congreso. La inscripción se busca por `(congresoId, usuarioId)`:
 * nadie puede pedir el certificado de otra persona (clarify P1, plan R3). `null` si el congreso no existe.
 */
export async function calcularCertificado(db: typeof Db, usuarioId: string, congresoId: string, ahora: Date): Promise<EstadoCertificado | null> {
  const congreso = await db.congreso.findUnique({
    where: { id: congresoId },
    select: { id: true, slug: true, nombre: true, sede: true, inicio: true, fin: true, zonaHoraria: true },
  });
  if (!congreso) return null;

  const ins = await db.inscripcion.findUnique({
    where: { congresoId_usuarioId: { congresoId, usuarioId } },
    include: {
      usuario: { select: { nombre: true } },
      agenda: { include: { sesion: { include: { propuesta: { select: { titulo: true } }, sala: { select: { nombre: true } } } } } },
      asistencias: { select: { sesionId: true } },
    },
  });

  const vacio = { porcentaje: 0, asistidas: 0, total: 0, horas: horasCertificadas([]), sesiones: [] as SesionCertificado[] };
  if (!ins || ins.estado !== "CONFIRMADA") {
    return { estado: "SIN_INSCRIPCION", disponible: false, motivo: "No tienes una inscripción confirmada en este congreso", ...vacio, congreso, titular: null };
  }

  // R4: denominador = turnos de la agenda (sesiones solapadas cuentan como una, clarify-2 P3); numerador = turnos con
  // asistencia. Las asistencias de fuera de la agenda no cuentan.
  const asistio = new Set(ins.asistencias.map((a) => a.sesionId));
  const sesiones: SesionCertificado[] = ins.agenda
    .map(({ sesion: s }) => ({ id: s.id, titulo: s.propuesta.titulo, sala: s.sala.nombre, inicio: s.inicio, fin: s.fin, asistida: asistio.has(s.id) }))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  const { asistidas, total } = recuentoPorTurnos(sesiones);
  const asistidasSes = sesiones.filter((s) => s.asistida);
  const porcentaje = porcentajeAsistencia(asistidas, total);
  const base = { porcentaje, asistidas, total, horas: horasCertificadas(asistidasSes), sesiones, congreso, titular: ins.usuario.nombre };

  // R2: orden de estados
  if (ahora < congreso.fin) {
    return { estado: "NO_FINALIZADO", disponible: false, motivo: `Disponible cuando termine el congreso (${fecha(congreso.fin, congreso.zonaHoraria)})`, ...base };
  }
  if (total === 0) return { estado: "AGENDA_VACIA", disponible: false, motivo: "No disponible: tu agenda no tiene sesiones", ...base };
  if (!cumpleUmbral(asistidas, total)) {
    return {
      estado: "BAJO_UMBRAL",
      disponible: false,
      motivo: `No disponible: has asistido al ${porcentaje} % de las sesiones de tu agenda (${asistidas} de ${total}); se necesita al menos el 80 %`,
      ...base,
    };
  }
  return { estado: "DISPONIBLE", disponible: true, motivo: "Disponible", ...base };
}
