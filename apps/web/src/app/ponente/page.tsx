import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ETIQUETA_ESTADO_PROPUESTA, fecha, type EstadoPropuesta } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Mis propuestas" };

const VARIANTE: Record<EstadoPropuesta, "secondary" | "warning" | "success" | "destructive"> = {
  ENVIADA: "secondary",
  EN_EVALUACION: "warning",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
};

/** spec-001 US2: solo las propias y solo su estado (FR-005, FR-010). */
export default async function MisPropuestasPage({ searchParams }: { searchParams: Promise<{ enviada?: string }> }) {
  const { enviada } = await searchParams;
  const propuestas = await (await api()).propuesta.mias();
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Mis propuestas</h1>
        <Button asChild>
          <Link href="/ponente/enviar">Enviar propuesta</Link>
        </Button>
      </div>
      {enviada && (
        <Alert variant="success">
          <CheckCircle2 aria-hidden />
          <p>Propuesta enviada. Podrás consultar aquí su estado.</p>
        </Alert>
      )}
      {propuestas.length === 0 ? (
        <p className="text-muted-foreground">Todavía no has enviado ninguna propuesta.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Congreso</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Enviada</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propuestas.map((p) => (
              <TableRow key={p.id} data-testid="fila-propuesta">
                <TableCell>{p.congreso.nombre}</TableCell>
                <TableCell className="font-medium">{p.titulo}</TableCell>
                <TableCell>{p.area.nombre}</TableCell>
                <TableCell className="whitespace-nowrap">{fecha(p.enviadaEn, p.congreso.zonaHoraria)}</TableCell>
                <TableCell>
                  <Badge variant={VARIANTE[p.estado]}>{ETIQUETA_ESTADO_PROPUESTA[p.estado]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
