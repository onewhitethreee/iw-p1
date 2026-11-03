import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { congresoFinalizado, diaLocal, diaSemana, fecha, hora } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/server";
import { AccionesSesion, FormularioProgramar, PublicarPrograma, type SalaOpcion } from "./acciones";

export const metadata: Metadata = { title: "Programa" };
export const dynamic = "force-dynamic";

/** spec-003 US1 (programar), US2 (modificar) y US3 (publicar). */
export default async function ProgramaOrganizadorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trpc = await api();
  let c;
  try {
    c = await trpc.congreso.porSlug({ slug });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const [pendientes, sesiones] = await Promise.all([trpc.programa.pendientes({ congresoId: c.id }), trpc.programa.sesiones({ congresoId: c.id })]);
  const z = c.zonaHoraria;
  const ahora = new Date();
  const finalizado = congresoFinalizado(c, ahora);
  const salas: SalaOpcion[] = c.salas.map((s) => ({ id: s.id, nombre: s.nombre, aforo: s.aforo }));
  const primerDia = diaLocal(c.inicio, z);
  const porDia = new Map<string, typeof sesiones>();
  for (const s of sesiones) {
    const d = diaLocal(s.inicio, z);
    porDia.set(d, [...(porDia.get(d) ?? []), s]);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{c.nombre}</p>
          <h1 className="text-2xl font-semibold">Programa</h1>
          <p className="text-sm text-muted-foreground">Horas en la zona del congreso ({z}).</p>
        </div>
        <div className="flex items-center gap-3">
          {c.estadoPrograma === "PUBLICADO" ? (
            <>
              <Badge variant="success">Publicado</Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/congresos/${c.slug}/programa`}>Ver página pública</Link>
              </Button>
            </>
          ) : (
            <>
              <Badge variant="secondary">Borrador</Badge>
              <PublicarPrograma congresoId={c.id} />
            </>
          )}
        </div>
      </div>

      {finalizado && <Alert variant="warning">El congreso ha finalizado: el programa ya no se puede modificar.</Alert>}

      {!finalizado && (
        <Card>
          <CardHeader>
            <CardTitle>Ponencias aceptadas pendientes de programar ({pendientes.length})</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pendientes.length === 0 && <p className="text-sm text-muted-foreground">No hay ponencias pendientes.</p>}
            {pendientes.map((p) => (
              <div key={p.propuestaId} className="grid gap-2 rounded-lg border p-3" data-testid="pendiente">
                <div>
                  <span className="font-medium">{p.titulo}</span>
                  <span className="text-sm text-muted-foreground"> · {p.autor.nombre} · {p.area.nombre}</span>
                </div>
                <FormularioProgramar propuestaId={p.propuestaId} salas={salas} diaPorDefecto={primerDia} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sesiones.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay sesiones programadas.</p>
      ) : (
        [...porDia.entries()].map(([dia, lista]) => (
          <section key={dia} className="grid gap-2">
            <h2 className="text-lg font-semibold capitalize">{diaSemana(lista[0]!.inicio, z)}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Ponencia</TableHead>
                  <TableHead className="text-right">Reservas / aforo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((s) => (
                  <TableRow key={s.id} data-testid="sesion-org" className="align-top">
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {hora(s.inicio, z)}–{hora(s.fin, z)}
                    </TableCell>
                    <TableCell>{s.sala.nombre}</TableCell>
                    <TableCell>
                      <div className="font-medium">{s.propuesta.titulo}</div>
                      <div className="text-xs text-muted-foreground">{s.propuesta.autor.nombre}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.reservas} / {s.sala.aforo}
                    </TableCell>
                    <TableCell className="min-w-72">
                      {!finalizado && (
                        <AccionesSesion
                          sesionId={s.id}
                          salas={salas}
                          salaActual={s.sala.id}
                          dia={dia}
                          horaInicio={hora(s.inicio, z)}
                          horaFin={hora(s.fin, z)}
                          empezada={s.inicio <= ahora}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        ))
      )}
      <p className="text-xs text-muted-foreground">Congreso del {fecha(c.inicio, z)} al {fecha(c.fin, z)}.</p>
    </div>
  );
}
