import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { estaDecidida, MIN_EVALUACIONES } from "@congresalia/domain";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { EstadoPropuestaBadge } from "~/components/estado-propuesta";
import { api } from "~/trpc/server";
import { AsignarEvaluador, DecidirPropuesta } from "./acciones";

export const metadata: Metadata = { title: "Propuestas" };

const fmtMedia = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** spec-002 US2 (asignar) y US3 (decidir): el organizador sí ve al autor. */
export default async function PropuestasPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ orden?: string }> }) {
  const [{ slug }, { orden }] = await Promise.all([params, searchParams]);
  const trpc = await api();
  let congreso;
  try {
    congreso = await trpc.congreso.porSlug({ slug });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const [propuestas, comite] = await Promise.all([trpc.evaluacion.resumenOrganizador({ congresoId: congreso.id }), trpc.evaluacion.miembrosComite()]);
  if (orden === "media") propuestas.sort((a, b) => (b.media ?? -1) - (a.media ?? -1));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{congreso.nombre}</p>
          <h1 className="text-2xl font-semibold">Propuestas</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          {orden === "media" ? <Link href="?">Orden de envío</Link> : <Link href="?orden=media">Ordenar por media</Link>}
        </Button>
      </div>
      {propuestas.length === 0 ? (
        <p className="text-muted-foreground">Este congreso no tiene propuestas.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propuesta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Evaluadores</TableHead>
              <TableHead className="text-right">Evaluaciones</TableHead>
              <TableHead className="text-right">Media</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propuestas.map((p) => {
              const decidida = estaDecidida(p.estado);
              const asignados = new Set(p.evaluadores.map((e) => e.id));
              return (
                <TableRow key={p.id} data-testid="fila-propuesta-org" className="align-top">
                  <TableCell>
                    <div className="font-medium">{p.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.autor.nombre} · {p.area.nombre}
                    </div>
                  </TableCell>
                  <TableCell>
                    <EstadoPropuestaBadge estado={p.estado} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.evaluadores.length === 0 ? (
                      <span className="text-muted-foreground">Sin asignar</span>
                    ) : (
                      <ul>
                        {p.evaluadores.map((e) => (
                          <li key={e.id}>
                            {e.evaluada ? "✓" : "·"} {e.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.nEvaluaciones}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.media === null ? "—" : fmtMedia.format(p.media)}</TableCell>
                  <TableCell className="min-w-64">
                    {!decidida && (
                      <div className="grid gap-2">
                        <AsignarEvaluador propuestaId={p.id} candidatos={comite.filter((c) => !asignados.has(c.id))} />
                        <DecidirPropuesta propuestaId={p.id} faltan={Math.max(0, MIN_EVALUACIONES - p.nEvaluaciones)} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
