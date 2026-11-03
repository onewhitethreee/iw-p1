import type { MetadataRoute } from "next";
import { db } from "~/server/db";
import { URL_BASE } from "~/lib/seo";

export const dynamic = "force-dynamic";

/** spec-003 FR-009: portada, congresos y, si el programa está publicado, programa y sesiones. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const congresos = await db.congreso.findMany({
    select: { slug: true, updatedAt: true, estadoPrograma: true, sesiones: { select: { id: true, updatedAt: true } } },
  });
  const entradas: MetadataRoute.Sitemap = [{ url: `${URL_BASE}/`, changeFrequency: "daily", priority: 1 }];
  for (const c of congresos) {
    entradas.push({ url: `${URL_BASE}/congresos/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 });
    if (c.estadoPrograma !== "PUBLICADO") continue;
    entradas.push({ url: `${URL_BASE}/congresos/${c.slug}/programa`, lastModified: c.updatedAt, changeFrequency: "daily", priority: 0.9 });
    for (const s of c.sesiones) entradas.push({ url: `${URL_BASE}/congresos/${c.slug}/programa/${s.id}`, lastModified: s.updatedAt, priority: 0.6 });
  }
  return entradas;
}
