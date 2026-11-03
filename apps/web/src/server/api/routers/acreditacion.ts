import { hora } from "@congresalia/domain";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, roleProcedure } from "~/server/api/trpc";

/**
 * HU-06: control de acceso a la sala con QR.
 * Contrato: specs/006-acceso-qr/contracts/acreditacion.md · Orden de comprobación: plan.md R2.
 */

/** La sala se abre 30 minutos antes del inicio de la sesión (FR-010). */
const APERTURA_MS = 30 * 60_000;

type Resultado = "ADMITIDO" | "YA_REGISTRADO" | "RECHAZADO";

const acreditacionProcedure = roleProcedure("ACREDITACION");

const noEncontrada = () => new TRPCError({ code: "NOT_FOUND", message: "La sesión no existe" });

export const acreditacionRouter = createTRPCRouter({
  /** Sesiones del congreso para elegir la puerta (FR-002, R6). */
  sesiones: acreditacionProcedure.input(z.object({ congresoId: z.string().min(1) })).query(async ({ ctx, input }) => {
    const ahora = ctx.ahora().getTime();
    const sesiones = await ctx.db.sesion.findMany({
      where: { congresoId: input.congresoId },
      orderBy: [{ inicio: "asc" }, { sala: { nombre: "asc" } }],
      include: { propuesta: { select: { titulo: true } }, sala: true, _count: { select: { asistencias: true } } },
    });
    return sesiones.map((s) => ({
      id: s.id,
      titulo: s.propuesta.titulo,
      sala: s.sala.nombre,
      inicio: s.inicio,
      fin: s.fin,
      aforo: s.sala.aforo,
      asistencias: s._count.asistencias,
      abierta: ahora >= s.inicio.getTime() - APERTURA_MS && ahora < s.fin.getTime(),
    }));
  }),

  /** Escaneo de una acreditación en la puerta de una sesión (FR-003…FR-006, FR-008…FR-010). */
  escanear: acreditacionProcedure
    .input(z.object({ sesionId: z.string().min(1), codigo: z.string().trim().min(1, "Escribe el código de acreditación") }))
    .mutation(async ({ ctx, input }) => {
      const ahora = ctx.ahora();
      return ctx.db.$transaction(async (tx) => {
        // R3: bloquear la sesión para que dos puertas no cuenten a la vez el mismo aforo
        const bloqueo = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Sesion" WHERE id = ${input.sesionId} FOR UPDATE`;
        if (bloqueo.length === 0) throw noEncontrada();
        const sesion = await tx.sesion.findUniqueOrThrow({
          where: { id: input.sesionId },
          include: { sala: true, congreso: { select: { zonaHoraria: true } } },
        });
        const aforo = sesion.sala.aforo;
        const responder = async (resultado: Resultado, motivo: string, asistente: string | null = null) => ({
          resultado,
          motivo,
          asistente,
          ocupacion: { asistencias: await tx.asistencia.count({ where: { sesionId: sesion.id } }), aforo },
        });

        // 1. El código existe
        const ins = await tx.inscripcion.findUnique({
          where: { codigoAcreditacion: input.codigo },
          include: { usuario: { select: { nombre: true } } },
        });
        if (!ins) return responder("RECHAZADO", "Acreditación no válida");
        // 2. Es del mismo congreso
        if (ins.congresoId !== sesion.congresoId) return responder("RECHAZADO", "Acreditación de otro congreso");
        // 3. La inscripción está confirmada
        if (ins.estado !== "CONFIRMADA") return responder("RECHAZADO", "Inscripción no confirmada");
        // 4. Ventana de acceso [inicio − 30 min, fin)
        const abre = new Date(sesion.inicio.getTime() - APERTURA_MS);
        if (ahora < abre) {
          return responder("RECHAZADO", `La sesión aún no está abierta (se abre a las ${hora(abre, sesion.congreso.zonaHoraria)})`);
        }
        if (ahora >= sesion.fin) return responder("RECHAZADO", "La sesión ya ha terminado");
        // 5. Ya registrado: no consume aforo
        const previa = await tx.asistencia.findUnique({ where: { inscripcionId_sesionId: { inscripcionId: ins.id, sesionId: sesion.id } } });
        if (previa) return responder("YA_REGISTRADO", "Ya registrado en esta sesión", ins.usuario.nombre);
        // 6. Aforo de la sala (FR-003)
        const asistencias = await tx.asistencia.count({ where: { sesionId: sesion.id } });
        if (asistencias >= aforo) return responder("RECHAZADO", "Aforo completo");
        // 7. Quien no reservó solo ocupa plazas sin reservar (FR-009, clarify P3)
        const reservada = await tx.entradaAgenda.findUnique({ where: { inscripcionId_sesionId: { inscripcionId: ins.id, sesionId: sesion.id } } });
        if (!reservada) {
          const reservas = await tx.entradaAgenda.count({ where: { sesionId: sesion.id } });
          const sinReserva = await tx.asistencia.count({
            where: { sesionId: sesion.id, inscripcion: { agenda: { none: { sesionId: sesion.id } } } },
          });
          if (reservas + sinReserva >= aforo) return responder("RECHAZADO", "No quedan plazas sin reservar");
        }
        await tx.asistencia.create({ data: { inscripcionId: ins.id, sesionId: sesion.id, registradaPorId: ctx.usuario.id, registradaEn: ahora } });
        return responder("ADMITIDO", "Admitido", ins.usuario.nombre);
      });
    }),

  /** Ocupación actual de la sesión, consultada cada pocos segundos en la puerta (FR-007, US2). */
  ocupacion: acreditacionProcedure.input(z.object({ sesionId: z.string().min(1) })).query(async ({ ctx, input }) => {
    const s = await ctx.db.sesion.findUnique({
      where: { id: input.sesionId },
      select: { sala: { select: { aforo: true } }, _count: { select: { asistencias: true } } },
    });
    if (!s) throw noEncontrada();
    return { asistencias: s._count.asistencias, aforo: s.sala.aforo };
  }),
});
