import Link from "next/link";
import { MapPin } from "lucide-react";
import { fecha } from "@congresalia/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FaseBadge } from "~/components/fase-badge";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Portada() {
  const congresos = await (await api()).congreso.listar();
  return (
    <div className="grid gap-8">
      <section className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Congresos de salud y educación</h1>
        <p className="max-w-2xl text-muted-foreground">
          Envía tu propuesta de ponencia, consulta el programa, inscríbete y descarga tu certificado de asistencia.
        </p>
      </section>
      <section aria-label="Congresos" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {congresos.map((c) => (
          <Link key={c.id} href={`/congresos/${c.slug}`} className="group" data-testid="tarjeta-congreso">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <FaseBadge fase={c.fase} />
                <CardTitle className="text-lg group-hover:text-primary">{c.nombre}</CardTitle>
                <CardDescription>
                  {fecha(c.inicio, c.zonaHoraria)} – {fecha(c.fin, c.zonaHoraria)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden /> {c.sede}
              </CardContent>
            </Card>
          </Link>
        ))}
        {congresos.length === 0 && <p className="text-muted-foreground">Todavía no hay congresos.</p>}
      </section>
    </div>
  );
}
