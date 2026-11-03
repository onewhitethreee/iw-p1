import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { agendaRouter } from "~/server/api/routers/agenda";
import { congresoRouter } from "~/server/api/routers/congreso";

/** Un router por spec (ver specs/000-core/contracts/trpc-api.md). */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  congreso: congresoRouter,
  agenda: agendaRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
