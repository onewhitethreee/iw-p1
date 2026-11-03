import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Mi agenda" };
export const dynamic = "force-dynamic";

/** spec-005: congresos en los que puedo construir agenda (inscripción confirmada). */
export default async function AgendaIndexPage() {
  const congresos = await (await api()).agenda.congresos();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Mi agenda</h1>
      {congresos.length === 0 ? (
        <p className="text-muted-foreground">No tienes inscripciones confirmadas. Inscríbete y paga para construir tu agenda.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {congresos.map((c) => (
            <Link key={c.slug} href={`/area-personal/agenda/${c.slug}`} data-testid="congreso-agenda">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{c.nombre}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
