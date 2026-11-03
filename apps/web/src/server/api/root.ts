import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { agendaRouter } from "~/server/api/routers/agenda";
import { congresoRouter } from "~/server/api/routers/congreso";
import { propuestaRouter } from "~/server/api/routers/propuesta";
import { evaluacionRouter } from "~/server/api/routers/evaluacion";
import { programaRouter } from "~/server/api/routers/programa";
import { inscripcionRouter } from "~/server/api/routers/inscripcion";
import { acreditacionRouter } from "~/server/api/routers/acreditacion";
import { certificadoRouter } from "~/server/api/routers/certificado";
import { panelRouter } from "~/server/api/routers/panel";

/** Un router por spec (ver specs/000-core/contracts/trpc-api.md). */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  congreso: congresoRouter,
  propuesta: propuestaRouter,
  evaluacion: evaluacionRouter,
  programa: programaRouter,
  inscripcion: inscripcionRouter,
  agenda: agendaRouter,
  acreditacion: acreditacionRouter,
  certificado: certificadoRouter,
  panel: panelRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
