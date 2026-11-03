"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ETIQUETA_TIPO_ASISTENTE, euros, hora } from "@congresalia/domain";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { useTRPC } from "~/trpc/react";

type Resumen = inferRouterOutputs<AppRouter>["panel"]["resumen"];

const horaSeg = (d: Date, zona: string) =>
  new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: zona }).format(d);

const TARIFA = { TEMPRANA: "Temprana", GENERAL: "General" } as const;

/** Panel del congreso: cifras, desglose y ocupación, refrescados cada 5 s (FR-004, plan R1). */
export function Panel({ congresoId, zona, inicial }: { congresoId: string; zona: string; inicial: Resumen }) {
  const trpc = useTRPC();
  const opciones = trpc.panel.resumen.queryOptions({ congresoId });
  const q = useQuery({ ...opciones, initialData: inicial, refetchInterval: 5_000, retry: false });
  const r = q.data;
  const [soloLlenas, setSoloLlenas] = useState(false);
  const sesiones = soloLlenas ? r.sesiones.filter((s) => s.nivel) : r.sesiones;

  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="actualizado">
        {q.isRefetchError ? (
          <span className="font-medium text-destructive">Sin actualizar desde {horaSeg(r.calculadoEn, zona)}</span>
        ) : (
          <>Actualizado a las {horaSeg(r.calculadoEn, zona)}</>
        )}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Cifra titulo="Confirmadas" valor={String(r.inscripciones.confirmadas)} id="confirmadas" />
        <Cifra titulo="Pendientes de pago" valor={String(r.inscripciones.pendientes)} id="pendientes" />
        <Cifra titulo="Ingresos" valor={euros(r.ingresosCent)} id="ingresos" />
      </div>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Desglose por tipo de entrada</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de asistente</TableHead>
              <TableHead>Tarifa</TableHead>
              <TableHead className="text-right">Confirmadas</TableHead>
              <TableHead className="text-right">Pendientes</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {r.desglose.map((d) => (
              <TableRow key={`${d.tipoAsistente}-${d.tarifa}`} data-testid="fila-desglose">
                <TableCell>{ETIQUETA_TIPO_ASISTENTE[d.tipoAsistente]}</TableCell>
                <TableCell>{TARIFA[d.tarifa]}</TableCell>
                <TableCell className="text-right tabular-nums">{d.confirmadas}</TableCell>
                <TableCell className="text-right tabular-nums">{d.pendientes}</TableCell>
                <TableCell className="text-right tabular-nums">{euros(d.ingresosCent)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Ocupación de las sesiones</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={soloLlenas} onChange={(e) => setSoloLlenas(e.target.checked)} />
            Solo completas o casi completas
          </label>
        </div>
        {sesiones.length === 0 ? (
          <p className="text-muted-foreground">No hay sesiones que mostrar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sesión</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">Asistencias</TableHead>
                <TableHead className="text-right">Ocupación</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sesiones.map((s) => (
                <FilaSesion key={s.id} s={s} zona={zona} congresoId={congresoId} />
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

function Cifra({ titulo, valor, id }: { titulo: string; valor: string; id: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-normal text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums" data-testid={id}>
          {valor}
        </p>
      </CardContent>
    </Card>
  );
}

function FilaSesion({ s, zona, congresoId }: { s: Resumen["sesiones"][number]; zona: string; congresoId: string }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <TableRow data-testid="sesion-panel">
        <TableCell className="font-medium">
          {s.titulo}
          {s.nivel === "COMPLETA" && (
            <Badge variant="destructive" className="ml-2">
              Completa
            </Badge>
          )}
          {s.nivel === "CASI_COMPLETA" && (
            <Badge variant="warning" className="ml-2">
              Casi completa
            </Badge>
          )}
        </TableCell>
        <TableCell data-testid="sala">
          {s.sala} <span className="text-muted-foreground">({s.aforo})</span>
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {hora(s.inicio, zona)}–{hora(s.fin, zona)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {s.reservas} / {s.aforo}
        </TableCell>
        <TableCell className="text-right tabular-nums" data-testid="asistencias">
          {s.asistencias} / {s.aforo}
        </TableCell>
        <TableCell className="text-right tabular-nums">{s.ocupacion} %</TableCell>
        <TableCell className="text-right">
          {s.movible && (
            <Button size="sm" variant="outline" onClick={() => setAbierta((v) => !v)}>
              Cambiar de sala
            </Button>
          )}
        </TableCell>
      </TableRow>
      {abierta && (
        <TableRow>
          <TableCell colSpan={7}>
            <CambiarSala sesionId={s.id} congresoId={congresoId} alTerminar={() => setAbierta(false)} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

/** US3: salas libres con aforo suficiente y confirmación; el servidor revalida (FR-005). */
function CambiarSala({ sesionId, congresoId, alTerminar }: { sesionId: string; congresoId: string; alTerminar: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const libres = useQuery({ ...trpc.panel.salasLibres.queryOptions({ sesionId }), staleTime: 0, retry: false });
  const [salaId, setSalaId] = useState("");
  const cambiar = useMutation(
    trpc.panel.cambiarSala.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.panel.resumen.queryKey({ congresoId }) });
        alTerminar();
      },
    }),
  );
  if (libres.isPending) return <p className="text-sm text-muted-foreground">Buscando salas libres…</p>;
  if (libres.error) return <p role="alert" className="text-sm text-destructive">{libres.error.message}</p>;
  if (libres.data.length === 0) return <p className="text-sm text-muted-foreground">No hay salas libres en ese horario con aforo suficiente.</p>;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (salaId) cambiar.mutate({ sesionId, salaId });
      }}
    >
      <label className="grid gap-1 text-sm">
        Nueva sala
        <select
          className="h-9 rounded-md border bg-background px-2"
          value={salaId}
          onChange={(e) => setSalaId(e.target.value)}
          aria-label="Nueva sala"
        >
          <option value="">Elige una sala…</option>
          {libres.data.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} (aforo {s.aforo})
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="sm" disabled={!salaId || cambiar.isPending}>
        Confirmar
      </Button>
      {cambiar.error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {cambiar.error.message}
        </p>
      )}
    </form>
  );
}
