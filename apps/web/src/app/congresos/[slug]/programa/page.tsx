import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { TRPCError } from "@trpc/server";
import { diaSemana, fecha, hora } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { jsonLdCongreso, scriptJsonLd } from "~/lib/seo";
import { api } from "~/trpc/server";

/** R4: renderizado dinámico en servidor → HTML completo (SEO) y cambios visibles al instante. */
export const dynamic = "force-dynamic";

const cargar = cache(async (slug: string) => {
  try {
    return await (await api()).programa.publico({ slug });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await cargar((await params).slug);
  const c = r.congreso;
  const title = `Programa de ${c.nombre}`;
  const description = `Programa de ${c.nombre} (${fecha(c.inicio, c.zonaHoraria)} – ${fecha(c.fin, c.zonaHoraria)}, ${c.sede}): sesiones, salas, horarios y ponentes.`;
  const url = `/congresos/${c.slug}/programa`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", locale: "es_ES", siteName: "Congresalia" },
    robots: r.publicado ? { index: true, follow: true } : { index: false, follow: true },
  };
}

/** spec-003 US3: programa público (FR-009, FR-010). */
export default async function ProgramaPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await cargar((await params).slug);
  const c = r.congreso;
  const z = c.zonaHoraria;
  return (
    <article className="grid gap-6">
      <header className="grid gap-1">
        <Link href={`/congresos/${c.slug}`} className="text-sm text-primary underline-offset-4 hover:underline">
          {c.nombre}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Programa</h1>
        <p className="text-muted-foreground">
          {fecha(c.inicio, z)} – {fecha(c.fin, z)} · {c.sede}
        </p>
      </header>
      {!r.publicado ? (
        <Alert>El programa aún no se ha publicado.</Alert>
      ) : (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={scriptJsonLd(jsonLdCongreso(c, r.dias.flatMap((d) => d.sesiones)))}
          />
          {r.dias.length === 0 && <p className="text-muted-foreground">Sin sesiones todavía.</p>}
          {r.dias.map((d) => (
            <section key={d.dia} className="grid gap-3" aria-labelledby={`dia-${d.dia}`}>
              <h2 id={`dia-${d.dia}`} className="text-xl font-semibold capitalize">
                {diaSemana(d.sesiones[0]!.inicio, z)}
              </h2>
              <ol className="grid gap-2">
                {d.sesiones.map((s) => (
                  <li key={s.id} className="grid gap-1 rounded-lg border bg-card p-4 sm:grid-cols-[8rem_1fr]" data-testid="sesion-publica">
                    <time dateTime={s.inicio.toISOString()} className="font-medium tabular-nums">
                      {hora(s.inicio, z)}–{hora(s.fin, z)}
                    </time>
                    <div>
                      <h3 className="font-semibold">
                        <Link href={`/congresos/${c.slug}/programa/${s.id}`} className="hover:text-primary hover:underline">
                          {s.titulo}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {s.ponente} · {s.sala} · {s.area}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </>
      )}
    </article>
  );
}
