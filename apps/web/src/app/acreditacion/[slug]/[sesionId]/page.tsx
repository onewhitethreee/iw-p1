import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hora } from "@congresalia/domain";
import { api } from "~/trpc/server";
import { Escaner } from "./escaner";

export const metadata: Metadata = { title: "Control de acceso" };
export const dynamic = "force-dynamic";

/** spec-006 US1/US2: puerta de una sesión (lector QR, código manual, resultado y ocupación). */
export default async function PuertaPage({ params }: { params: Promise<{ slug: string; sesionId: string }> }) {
  const { slug, sesionId } = await params;
  const caller = await api();
  const congreso = await caller.congreso.porSlug({ slug }).catch(() => null);
  if (!congreso) notFound();
  const sesion = (await caller.acreditacion.sesiones({ congresoId: congreso.id })).find((s) => s.id === sesionId);
  if (!sesion) notFound();
  const zona = congreso.zonaHoraria;
  return (
    <div className="mx-auto grid w-full max-w-xl gap-4">
      <div className="grid gap-1">
        <Link href={`/acreditacion/${slug}`} className="text-sm text-muted-foreground hover:underline">
          ← Sesiones de {congreso.nombre}
        </Link>
        <h1 className="text-xl font-semibold">{sesion.titulo}</h1>
        <p className="text-muted-foreground">
          {sesion.sala} · {hora(sesion.inicio, zona)}–{hora(sesion.fin, zona)}
        </p>
      </div>
      <Escaner sesionId={sesion.id} inicial={{ asistencias: sesion.asistencias, aforo: sesion.aforo }} />
    </div>
  );
}
