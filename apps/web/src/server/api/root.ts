import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { congresoRouter } from "~/server/api/routers/congreso";
import { panelRouter } from "~/server/api/routers/panel";

/** Un router por spec (ver specs/000-core/contracts/trpc-api.md). */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  congreso: congresoRouter,
  panel: panelRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
