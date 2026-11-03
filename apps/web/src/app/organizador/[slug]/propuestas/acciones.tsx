"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { NativeSelect } from "~/components/ui/input";
import { useTRPC } from "~/trpc/react";

/** spec-002 US2: asignar un miembro del comité. Las reglas las aplica el servidor. */
export function AsignarEvaluador({ propuestaId, candidatos }: { propuestaId: string; candidatos: { id: string; nombre: string }[] }) {
  const router = useRouter();
  const trpc = useTRPC();
  const asignar = useMutation(trpc.evaluacion.asignar.mutationOptions({ onSuccess: () => router.refresh() }));
  const [evaluadorId, setEvaluadorId] = useState("");
  return (
    <div className="grid gap-1">
      <div className="flex gap-2">
        <NativeSelect aria-label="Asignar evaluador" value={evaluadorId} onChange={(e) => setEvaluadorId(e.target.value)} className="h-8 text-xs">
          <option value="">Asignar evaluador…</option>
          {candidatos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </NativeSelect>
        <Button size="sm" variant="outline" disabled={!evaluadorId || asignar.isPending} onClick={() => asignar.mutate({ propuestaId, evaluadorId }, { onSuccess: () => setEvaluadorId("") })}>
          Asignar
        </Button>
      </div>
      {asignar.error && (
        <p role="alert" className="text-xs text-destructive">
          {asignar.error.message}
        </p>
      )}
    </div>
  );
}

/** spec-002 US3: aceptar o rechazar; avisa si faltan evaluaciones (el servidor lo vuelve a comprobar). */
export function DecidirPropuesta({ propuestaId, faltan }: { propuestaId: string; faltan: number }) {
  const router = useRouter();
  const trpc = useTRPC();
  const decidir = useMutation(trpc.evaluacion.decidir.mutationOptions({ onSuccess: () => router.refresh() }));
  return (
    <div className="grid gap-1">
      <div className="flex gap-2">
        <Button size="sm" disabled={decidir.isPending} onClick={() => decidir.mutate({ propuestaId, decision: "ACEPTAR" })}>
          Aceptar
        </Button>
        <Button size="sm" variant="destructive" disabled={decidir.isPending} onClick={() => decidir.mutate({ propuestaId, decision: "RECHAZAR" })}>
          Rechazar
        </Button>
      </div>
      {faltan > 0 && <p className="text-xs text-muted-foreground">Faltan {faltan} evaluaciones para poder decidir.</p>}
      {decidir.error && (
        <p role="alert" className="text-xs text-destructive">
          {decidir.error.message}
        </p>
      )}
    </div>
  );
}
