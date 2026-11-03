import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { EstadoPropuestaBadge } from "~/components/estado-propuesta";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Mis evaluaciones" };

/** spec-002 US1-1: solo las asignadas y sin datos del autor (vista anónima). */
export default async function MisEvaluacionesPage() {
  const asignaciones = await (await api()).evaluacion.misAsignaciones({});
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">Mis evaluaciones</h1>
        <p className="text-sm text-muted-foreground">La revisión es anónima: no se muestra la autoría de las propuestas.</p>
      </div>
      {asignaciones.length === 0 ? (
        <p className="text-muted-foreground">No tienes propuestas asignadas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Congreso</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Propuesta</TableHead>
              <TableHead>Mi evaluación</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {asignaciones.map((a) => (
              <TableRow key={a.asignacionId} data-testid="fila-asignacion">
                <TableCell>{a.propuesta.congreso.nombre}</TableCell>
                <TableCell className="font-medium">{a.propuesta.titulo}</TableCell>
                <TableCell>{a.propuesta.area.nombre}</TableCell>
                <TableCell>
                  <EstadoPropuestaBadge estado={a.propuesta.estado} />
                </TableCell>
                <TableCell>{a.evaluada ? <Badge variant="success">Evaluada ({a.puntuacion})</Badge> : <Badge variant="outline">Pendiente</Badge>}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant={a.evaluada ? "outline" : "default"}>
                    <Link href={`/comite/evaluar/${a.asignacionId}`}>{a.evaluada ? "Ver" : "Evaluar"}</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
