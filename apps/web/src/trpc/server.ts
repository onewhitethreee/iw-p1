import "server-only";
import { cache } from "react";
import { createCaller } from "~/server/api/root";
import { crearContexto } from "~/server/api/trpc";
import { getUsuarioActual } from "~/server/usuario-actual";

/** Caller de tRPC para Server Components: mismas reglas y permisos que la API. */
export const api = cache(async () => createCaller(crearContexto(await getUsuarioActual())));
