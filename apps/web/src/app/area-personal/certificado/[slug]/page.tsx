import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Download, X } from "lucide-react";
import { fecha, hora } from "@congresalia/domain";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Certificado" };
export const dynamic = "force-dynamic";

/** spec-007 US1: porcentaje, motivo, sesiones de la agenda y descarga (FR-003). */
export default async function CertificadoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caller = await api();
  const congreso = await caller.congreso.porSlug({ slug }).catch(() => null);
  if (!congreso) notFound();
  const c = await caller.certificado.estado({ congresoId: congreso.id });
  const zona = congreso.zonaHoraria;
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <Link href="/area-personal/certificado" className="text-sm text-muted-foreground hover:underline">
          ← Mis congresos
        </Link>
        <h1 className="text-2xl font-semibold">{congreso.nombre}</h1>
      </div>

      {c.estado !== "SIN_INSCRIPCION" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {c.estado === "NO_FINALIZADO" ? "Asistencia provisional" : "Asistencia sobre las sesiones de tu agenda"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            <p className="text-3xl font-semibold tabular-nums" data-testid="porcentaje">
              {c.porcentaje} % ({c.asistidas} de {c.total} sesiones)
            </p>
            {c.total < c.sesiones.length && (
              <p className="text-sm text-muted-foreground">Las sesiones de tu agenda que se solapan cuentan como una.</p>
            )}
            <p className="text-muted-foreground">Horas de formación: {c.horas.texto}</p>
          </CardContent>
        </Card>
      )}

      {c.disponible ? (
        <Button asChild size="lg" className="justify-self-start">
          <a href={`/api/certificado/${congreso.id}`} download>
            <Download aria-hidden /> Descargar certificado
          </a>
        </Button>
      ) : (
        <Alert data-testid="motivo">
          <AlertDescription>{c.motivo}</AlertDescription>
        </Alert>
      )}

      {c.sesiones.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-lg font-semibold">Sesiones de tu agenda</h2>
          <ul className="grid gap-1">
            {c.sesiones.map((s) => (
              <li key={s.id} className="flex items-center gap-2" data-testid="sesion-certificado">
                {s.asistida ? (
                  <Check className="size-4 text-success" aria-label="Asistida" />
                ) : (
                  <X className="size-4 text-muted-foreground" aria-label="No asistida" />
                )}
                <span>
                  {fecha(s.inicio, zona)}, {hora(s.inicio, zona)}–{hora(s.fin, zona)} · {s.titulo} <span className="text-muted-foreground">({s.sala})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
