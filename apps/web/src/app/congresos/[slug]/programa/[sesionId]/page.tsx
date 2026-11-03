import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { TRPCError } from "@trpc/server";
import { diaSemana, hora } from "@congresalia/domain";
import { jsonLdSesion, scriptJsonLd } from "~/lib/seo";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

const cargar = cache(async (slug: string, sesionId: string) => {
  try {
    return await (await api()).programa.sesionPublica({ slug, sesionId });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
});

type Params = { params: Promise<{ slug: string; sesionId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, sesionId } = await params;
  const s = await cargar(slug, sesionId);
  const description = `${s.ponente} · ${diaSemana(s.inicio, s.congreso.zonaHoraria)}, ${hora(s.inicio, s.congreso.zonaHoraria)} · ${s.sala}. ${s.resumen.slice(0, 120)}…`;
  const url = `/congresos/${slug}/programa/${sesionId}`;
  return {
    title: `${s.titulo} · ${s.congreso.nombre}`,
    description,
    alternates: { canonical: url },
    openGraph: { title: s.titulo, description, url, type: "article", locale: "es_ES", siteName: "Congresalia" },
  };
}

/** spec-003 US3-5: detalle indexable de una sesión. */
export default async function SesionPublicaPage({ params }: Params) {
  const { slug, sesionId } = await params;
  const s = await cargar(slug, sesionId);
  const z = s.congreso.zonaHoraria;
  return (
    <article className="mx-auto grid max-w-3xl gap-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={scriptJsonLd({ "@context": "https://schema.org", ...jsonLdSesion(s.congreso, s) })} />
      <Link href={`/congresos/${slug}/programa`} className="text-sm text-primary underline-offset-4 hover:underline">
        ← Programa de {s.congreso.nombre}
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{s.titulo}</h1>
      <p className="text-muted-foreground">
        <span className="capitalize">{diaSemana(s.inicio, z)}</span>, {hora(s.inicio, z)}–{hora(s.fin, z)} · {s.sala} · {s.area}
      </p>
      <p className="font-medium">Ponente: {s.ponente}</p>
      <p className="whitespace-pre-line leading-relaxed">{s.resumen}</p>
    </article>
  );
}
