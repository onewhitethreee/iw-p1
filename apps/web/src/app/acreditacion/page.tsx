import type { Metadata } from "next";
import Link from "next/link";
import { fecha } from "@congresalia/domain";
import { FaseBadge } from "~/components/fase-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Acreditación" };
export const dynamic = "force-dynamic";

/** spec-006: elegir congreso (en curso primero; los finalizados no se muestran). */
export default async function AcreditacionPage() {
  const congresos = (await (await api()).congreso.listar())
    .filter((c) => c.fase !== "FINALIZADO")
    .sort((a, b) => Number(b.fase === "EN_CURSO") - Number(a.fase === "EN_CURSO"));
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">Acreditación</h1>
        <p className="text-muted-foreground">Elige el congreso y después la sesión de tu puerta.</p>
      </div>
      {congresos.length === 0 ? (
        <p className="text-muted-foreground">No hay congresos en curso ni próximos.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {congresos.map((c) => (
            <Link key={c.id} href={`/acreditacion/${c.slug}`} data-testid="congreso-acreditacion">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{c.nombre}</CardTitle>
                    <FaseBadge fase={c.fase} />
                  </div>
                  <CardDescription>
                    {fecha(c.inicio, c.zonaHoraria)} · {c.sede}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
