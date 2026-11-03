import { hora, nivelOcupacion, primerSolape } from "@congresalia/domain";
import type { TarifaAplicada, TipoAsistente } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { conflicto, createTRPCRouter, roleProcedure } from "~/server/api/trpc";
import type { db as Db } from "~/server/db";

/**
 * HU-08: panel del congreso (contrato en specs/008-panel-tiempo-real/contracts/panel.md).
 * El cambio de sala aplica las reglas de spec-003 que afectan a un cambio de sala (plan R4).
 */

const TIPOS: TipoAsistente[] = ["PROFESIONAL", "SOCIO", "ESTUDIANTE"];
const TARIFAS: TarifaAplicada[] = ["TEMPRANA", "GENERAL"];

const organizador = roleProcedure("ORGANIZADOR");
type Tx = Parameters<Parameters<typeof Db.$transaction>[0]>[0];

const noEncontrada = (que: string) => new TRPCError({ code: "NOT_FOUND", message: `${que} no existe` });

/** Datos de la sesión para decidir un cambio de sala (P2/P3). */
async function sesionParaMover(db: Tx | typeof Db, sesionId: string, ahora: Date) {
  const s = await db.sesion.findUnique({
    where: { id: sesionId },
    include: {
      congreso: { select: { fin: true, zonaHoraria: true } },
      _count: { select: { agendas: true, asistencias: true } },
    },
  });
  if (!s) throw noEncontrada("La sesión");
  if (ahora >= s.congreso.fin) conflicto("El congreso ha finalizado: el programa ya no se puede cambiar");
  if (ahora >= s.fin) conflicto("La sesión ya ha terminado");
  return { ...s, ocupadas: Math.max(s._count.agendas, s._count.asistencias) };
}

/** Sesiones de una sala que se solapan con el horario dado (excluida la propia). */
async function solapesEnSala(db: Tx | typeof Db, salaId: string, sesion: { id: string; inicio: Date; fin: Date }) {
  const otras = await db.sesion.findMany({
    where: { salaId, id: { not: sesion.id }, inicio: { lt: sesion.fin }, fin: { gt: sesion.inicio } },
    include: { propuesta: { select: { titulo: true } } },
    orderBy: { inicio: "asc" },
  });
  return primerSolape(sesion, otras);
}

export const panelRouter = createTRPCRouter({
  /** Cifras del panel (FR-002, FR-003). Se consulta cada 5 s (FR-004). */
  resumen: organizador.input(z.object({ congresoId: z.string().min(1) })).query(async ({ ctx, input }) => {
    const ahora = ctx.ahora();
    const congreso = await ctx.db.congreso.findUnique({ where: { id: input.congresoId }, select: { id: true, fin: true } });
    if (!congreso) throw noEncontrada("El congreso");

    const [grupos, ingresos, sesiones] = await Promise.all([
      ctx.db.inscripcion.groupBy({
        by: ["tipoAsistente", "tarifaAplicada", "estado"],
        where: { congresoId: congreso.id },
        _count: { _all: true },
      }),
      ctx.db.$queryRaw<{ tipo: TipoAsistente; tarifa: TarifaAplicada; total: bigint }[]>`
        SELECT i."tipoAsistente" AS tipo, i."tarifaAplicada" AS tarifa, SUM(p."importeCent") AS total
        FROM "Pago" p JOIN "Inscripcion" i ON i.id = p."inscripcionId"
        WHERE i."congresoId" = ${congreso.id} AND p.resultado = 'APROBADO'
        GROUP BY i."tipoAsistente", i."tarifaAplicada"`,
      ctx.db.sesion.findMany({
        where: { congresoId: congreso.id },
        orderBy: [{ inicio: "asc" }, { id: "asc" }],
        include: {
          propuesta: { select: { titulo: true } },
          sala: { select: { nombre: true, aforo: true } },
          _count: { select: { agendas: true, asistencias: true } },
        },
      }),
    ]);

    const desglose = TIPOS.flatMap((tipoAsistente) =>
      TARIFAS.map((tarifa) => {
        const cuenta = (estado: string) =>
          grupos.find((g) => g.tipoAsistente === tipoAsistente && g.tarifaAplicada === tarifa && g.estado === estado)?._count._all ?? 0;
        const ing = ingresos.find((x) => x.tipo === tipoAsistente && x.tarifa === tarifa);
        return { tipoAsistente, tarifa, confirmadas: cuenta("CONFIRMADA"), pendientes: cuenta("PENDIENTE_PAGO"), ingresosCent: Number(ing?.total ?? 0) };
      }),
    );
    const finalizado = ahora >= congreso.fin;
    return {
      calculadoEn: ahora,
      inscripciones: {
        confirmadas: desglose.reduce((a, d) => a + d.confirmadas, 0),
        pendientes: desglose.reduce((a, d) => a + d.pendientes, 0),
      },
      ingresosCent: desglose.reduce((a, d) => a + d.ingresosCent, 0),
      desglose,
      sesiones: sesiones.map((s) => {
        const { porcentaje, nivel } = nivelOcupacion(s._count.agendas, s._count.asistencias, s.sala.aforo);
        return {
          id: s.id,
          titulo: s.propuesta.titulo,
          sala: s.sala.nombre,
          inicio: s.inicio,
          fin: s.fin,
          aforo: s.sala.aforo,
          reservas: s._count.agendas,
          asistencias: s._count.asistencias,
          ocupacion: porcentaje,
          nivel,
          movible: !finalizado && ahora < s.fin,
        };
      }),
    };
  }),

  /** Salas a las que se puede mover la sesión (US3-1, P2, P3). */
  salasLibres: organizador.input(z.object({ sesionId: z.string().min(1) })).query(async ({ ctx, input }) => {
    const s = await sesionParaMover(ctx.db, input.sesionId, ctx.ahora());
    const salas = await ctx.db.sala.findMany({
      where: { congresoId: s.congresoId, id: { not: s.salaId }, aforo: { gte: s.ocupadas } },
      orderBy: [{ aforo: "asc" }, { nombre: "asc" }],
      select: { id: true, nombre: true, aforo: true },
    });
    const libres = [];
    for (const sala of salas) if (!(await solapesEnSala(ctx.db, sala.id, s))) libres.push(sala);
    return libres;
  }),

  /** Cambia la sesión de sala revalidando todo con bloqueo (US3-2, US3-3, FR-005). */
  cambiarSala: organizador.input(z.object({ sesionId: z.string().min(1), salaId: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const ahora = ctx.ahora();
    return ctx.db.$transaction(async (tx) => {
      // R5: bloquear la sala destino serializa los cambios concurrentes hacia ella
      await tx.$queryRaw`SELECT id FROM "Sala" WHERE id = ${input.salaId} FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Sesion" WHERE id = ${input.sesionId} FOR UPDATE`;
      const s = await sesionParaMover(tx, input.sesionId, ahora);
      const sala = await tx.sala.findUnique({ where: { id: input.salaId } });
      if (!sala || sala.congresoId !== s.congresoId) throw noEncontrada("La sala");
      if (sala.id === s.salaId) conflicto("La sesión ya está en esa sala");
      const choque = await solapesEnSala(tx, sala.id, s);
      if (choque) {
        const z = s.congreso.zonaHoraria;
        conflicto(`La sala «${sala.nombre}» ya tiene «${choque.propuesta.titulo}» de ${hora(choque.inicio, z)} a ${hora(choque.fin, z)}`);
      }
      if (sala.aforo < s.ocupadas) {
        conflicto(`La sala «${sala.nombre}» tiene aforo ${sala.aforo} y la sesión ya tiene ${s.ocupadas} personas (reservas o asistencias)`);
      }
      await tx.sesion.update({ where: { id: s.id }, data: { salaId: sala.id } });
      return { sesionId: s.id, sala: sala.nombre, aforo: sala.aforo };
    });
  }),
});
