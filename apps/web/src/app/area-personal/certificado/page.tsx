import type { Metadata } from "next";
import Link from "next/link";
import { fecha } from "@congresalia/domain";
import { Badge } from "~/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Certificado" };
export const dynamic = "force-dynamic";

/** spec-007: congresos con inscripción confirmada. */
export default async function CertificadoIndexPage() {
  const congresos = await (await api()).certificado.congresos();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Certificado de asistencia</h1>
      {congresos.length === 0 ? (
        <p className="text-muted-foreground">No tienes inscripciones confirmadas.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {congresos.map((c) => (
            <Link key={c.id} href={`/area-personal/certificado/${c.slug}`} data-testid="congreso-certificado">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{c.nombre}</CardTitle>
                    <Badge variant={c.finalizado ? "outline" : "warning"}>{c.finalizado ? "Finalizado" : "En marcha o próximo"}</Badge>
                  </div>
                  <CardDescription>Termina el {fecha(c.fin, c.zonaHoraria)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
