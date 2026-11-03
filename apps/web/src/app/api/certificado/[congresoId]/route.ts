import { respuestaCertificado } from "~/server/pdf-certificado";
import { getUsuarioActual } from "~/server/usuario-actual";

export const dynamic = "force-dynamic";

/** HU-07: descarga del certificado; toda la lógica está en `respuestaCertificado` (plan R6). */
export async function GET(_req: Request, { params }: { params: Promise<{ congresoId: string }> }) {
  const { congresoId } = await params;
  return respuestaCertificado(await getUsuarioActual(), congresoId, new Date());
}
