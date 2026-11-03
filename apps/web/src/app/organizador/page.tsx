import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { fecha } from "@congresalia/domain";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FaseBadge } from "~/components/fase-badge";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Organización" };

/** Punto de entrada del organizador: por congreso, propuestas (spec-002) y programa (spec-003). */
export default async function OrganizadorPage() {
  const congresos = await (await api()).congreso.listar();
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Organización</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/organizador/panel">
            <LayoutDashboard aria-hidden /> Panel en tiempo real
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {congresos.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <FaseBadge fase={c.fase} />
              <CardTitle>{c.nombre}</CardTitle>
              <CardDescription>
                {fecha(c.inicio, c.zonaHoraria)} – {fecha(c.fin, c.zonaHoraria)}
              </CardDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/organizador/${c.slug}/propuestas`}>Propuestas</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/organizador/${c.slug}/programa`}>Programa</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
