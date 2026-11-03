import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { diaSemana, hora } from "@congresalia/domain";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Elegir sesión" };
export const dynamic = "force-dynamic";

/** spec-006 FR-002: el personal elige la sesión de su puerta. */
export default async function SesionesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caller = await api();
  const congreso = await caller.congreso.porSlug({ slug }).catch(() => null);
  if (!congreso) notFound();
  const sesiones = await caller.acreditacion.sesiones({ congresoId: congreso.id });
  const zona = congreso.zonaHoraria;
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <Link href="/acreditacion" className="text-sm text-muted-foreground hover:underline">
          ← Congresos
        </Link>
        <h1 className="text-2xl font-semibold">{congreso.nombre}</h1>
        <p className="text-muted-foreground">Elige la sesión que controlas. Cada sala se abre 30 minutos antes del inicio.</p>
      </div>
      {sesiones.length === 0 ? (
        <p className="text-muted-foreground">Este congreso todavía no tiene sesiones programadas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sesión</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead className="text-right">Ocupación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sesiones.map((s) => (
              <TableRow key={s.id} data-testid="sesion-acreditacion">
                <TableCell>
                  <Link href={`/acreditacion/${slug}/${s.id}`} className="font-medium hover:underline">
                    {s.titulo}
                  </Link>
                  {s.abierta && (
                    <Badge variant="success" className="ml-2">
                      Abierta ahora
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{s.sala}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="capitalize">{diaSemana(s.inicio, zona)}</span>, {hora(s.inicio, zona)}–{hora(s.fin, zona)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.asistencias} / {s.aforo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
