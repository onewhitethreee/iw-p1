import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/root";
import { crearContexto } from "~/server/api/trpc";
import { getUsuarioActual } from "~/server/usuario-actual";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => crearContexto(await getUsuarioActual()),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => console.error(`❌ tRPC ${path ?? "<sin ruta>"}: ${error.message}`)
        : undefined,
  });

export { handler as GET, handler as POST };
