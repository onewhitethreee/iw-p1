import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ETIQUETA_TIPO_ASISTENTE, euros, fecha } from "@congresalia/domain";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { FaseBadge } from "~/components/fase-badge";
import { api } from "~/trpc/server";

async function cargar(slug: string) {
  try {
    return await (await api()).congreso.porSlug({ slug });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await cargar((await params).slug);
  return { title: c.nombre, description: c.descripcion, alternates: { canonical: `/congresos/${c.slug}` } };
}

export default async function CongresoPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await cargar((await params).slug);
  const z = c.zonaHoraria;
  return (
    <article className="grid gap-6">
      <header className="grid gap-2">
        <FaseBadge fase={c.fase} />
        <h1 className="text-3xl font-bold tracking-tight">{c.nombre}</h1>
        <p className="text-muted-foreground">
          {fecha(c.inicio, z)} – {fecha(c.fin, z)} · {c.sede}
        </p>
        <p className="max-w-3xl">{c.descripcion}</p>
        <Button asChild className="w-fit">
          <Link href={`/congresos/${c.slug}/programa`}>Ver programa</Link>
        </Button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Llamada a comunicaciones</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            {/* FR-005a: se muestran días completos; envioCierra es exclusivo (00:00 del día siguiente) */}
            <p data-testid="plazo-envio">
              Plazo de envío: del {fecha(c.envioAbre, z)} al {fecha(new Date(c.envioCierra.getTime() - 1), z)} (ambos incluidos).
            </p>
            <p>Áreas temáticas: {c.areas.map((a) => a.nombre).join(", ")}.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tarifas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de asistente</TableHead>
                  <TableHead className="text-right">Hasta el {fecha(c.limiteTemprana, z)}</TableHead>
                  <TableHead className="text-right">General</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {c.tarifas.map((t) => (
                  <TableRow key={t.tipoAsistente}>
                    <TableCell>{ETIQUETA_TIPO_ASISTENTE[t.tipoAsistente]}</TableCell>
                    <TableCell className="text-right tabular-nums">{euros(t.importeTempranoCent)}</TableCell>
                    <TableCell className="text-right tabular-nums">{euros(t.importeGeneralCent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}
