import type { Metadata } from "next";
import Link from "next/link";
import { fecha } from "@congresalia/domain";
import { FaseBadge } from "~/components/fase-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

/** spec-008: elegir congreso. */
export default async function PanelIndexPage() {
  const congresos = await (await api()).congreso.listar();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Panel del congreso</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {congresos.map((c) => (
          <Link key={c.id} href={`/organizador/panel/${c.slug}`} data-testid="congreso-panel">
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
    </div>
  );
}
