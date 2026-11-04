import { PrismaClient } from "@prisma/client";

/** Acceso a la BD de desarrollo para obtener identificadores y preparar algún dato (siempre indicado en el vídeo). */
export const db = new PrismaClient();

export const idCongreso = async (slug: string) => (await db.congreso.findUniqueOrThrow({ where: { slug } })).id;
export const idSesion = async (titulo: string) => (await db.sesion.findFirstOrThrow({ where: { propuesta: { titulo } } })).id;
export const idPropuesta = async (titulo: string) => (await db.propuesta.findFirstOrThrow({ where: { titulo } })).id;
export const idUsuario = async (email: string) => (await db.usuario.findUniqueOrThrow({ where: { email } })).id;
export async function codigoDe(email: string, slug: string) {
  const ins = await db.inscripcion.findFirstOrThrow({ where: { usuario: { email }, congreso: { slug } } });
  return ins.codigoAcreditacion!;
}
