"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input, NativeSelect } from "~/components/ui/input";
import { useTRPC } from "~/trpc/react";

export interface SalaOpcion {
  id: string;
  nombre: string;
  aforo: number;
}

function Error({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {mensaje}
    </p>
  );
}

function SelectorSala({ salas, value, onChange }: { salas: SalaOpcion[]; value: string; onChange: (v: string) => void }) {
  return (
    <NativeSelect aria-label="Sala" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-44 text-xs">
      <option value="">Sala…</option>
      {salas.map((s) => (
        <option key={s.id} value={s.id}>
          {s.nombre} ({s.aforo})
        </option>
      ))}
    </NativeSelect>
  );
}

/** spec-003 US1: sala + día + horas locales (clarify P2/P3). Las reglas las aplica el servidor. */
export function FormularioProgramar({ propuestaId, salas, diaPorDefecto }: { propuestaId: string; salas: SalaOpcion[]; diaPorDefecto: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const programar = useMutation(trpc.programa.programar.mutationOptions({ onSuccess: () => router.refresh() }));
  const [salaId, setSalaId] = useState("");
  const [dia, setDia] = useState(diaPorDefecto);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <SelectorSala salas={salas} value={salaId} onChange={setSalaId} />
        <Input aria-label="Día" type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="h-8 w-40 text-xs" />
        <Input aria-label="Hora de inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="h-8 w-28 text-xs" />
        <Input aria-label="Hora de fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="h-8 w-28 text-xs" />
        <Button size="sm" disabled={!salaId || !horaInicio || !horaFin || programar.isPending} onClick={() => programar.mutate({ propuestaId, salaId, dia, horaInicio, horaFin })}>
          Programar
        </Button>
      </div>
      <Error mensaje={programar.error?.message} />
    </div>
  );
}

/** spec-003 US2: cambiar sala/horario (si empezó, solo sala) y quitar. */
export function AccionesSesion(props: { sesionId: string; salas: SalaOpcion[]; salaActual: string; dia: string; horaInicio: string; horaFin: string; empezada: boolean }) {
  const router = useRouter();
  const trpc = useTRPC();
  const mover = useMutation(trpc.programa.mover.mutationOptions({ onSuccess: () => { setAbierto(false); router.refresh(); } }));
  const quitar = useMutation(trpc.programa.quitar.mutationOptions({ onSuccess: () => router.refresh() }));
  const [abierto, setAbierto] = useState(false);
  const [salaId, setSalaId] = useState(props.salaActual);
  const [dia, setDia] = useState(props.dia);
  const [horaInicio, setHoraInicio] = useState(props.horaInicio);
  const [horaFin, setHoraFin] = useState(props.horaFin);

  if (!abierto)
    return (
      <div className="grid gap-1">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setAbierto(true)}>
            {props.empezada ? "Cambiar de sala" : "Cambiar"}
          </Button>
          {!props.empezada && (
            <Button
              size="sm"
              variant="ghost"
              disabled={quitar.isPending}
              onClick={() => window.confirm("¿Quitar esta sesión del programa?") && quitar.mutate({ sesionId: props.sesionId })}
            >
              Quitar
            </Button>
          )}
        </div>
        <Error mensaje={quitar.error?.message} />
      </div>
    );

  const guardar = () =>
    mover.mutate(
      props.empezada
        ? { sesionId: props.sesionId, salaId }
        : { sesionId: props.sesionId, salaId, dia, horaInicio, horaFin },
    );
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <SelectorSala salas={props.salas} value={salaId} onChange={setSalaId} />
        {!props.empezada && (
          <>
            <Input aria-label="Día" type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="h-8 w-40 text-xs" />
            <Input aria-label="Hora de inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="h-8 w-28 text-xs" />
            <Input aria-label="Hora de fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="h-8 w-28 text-xs" />
          </>
        )}
        <Button size="sm" disabled={mover.isPending} onClick={guardar}>
          Guardar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAbierto(false)}>
          Cancelar
        </Button>
      </div>
      <Error mensaje={mover.error?.message} />
    </div>
  );
}

/** spec-003 US3-1. */
export function PublicarPrograma({ congresoId }: { congresoId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const publicar = useMutation(trpc.programa.publicar.mutationOptions({ onSuccess: () => router.refresh() }));
  return (
    <div className="grid gap-1">
      <Button size="sm" disabled={publicar.isPending} onClick={() => publicar.mutate({ congresoId })}>
        Publicar programa
      </Button>
      <Error mensaje={publicar.error?.message} />
    </div>
  );
}
