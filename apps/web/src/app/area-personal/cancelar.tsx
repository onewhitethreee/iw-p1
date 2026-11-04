"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/react";

/** spec-004 FR-014 (clarify-2 P4, plan decisión 9): confirmación en la propia tarjeta, sin `window.confirm`. */
export function CancelarInscripcion({ inscripcionId }: { inscripcionId: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const [confirmando, setConfirmando] = useState(false);
  const cancelar = useMutation(trpc.inscripcion.cancelar.mutationOptions({ onSuccess: () => router.refresh() }));

  if (!confirmando)
    return (
      <Button size="sm" variant="outline" className="w-fit" onClick={() => setConfirmando(true)}>
        Cancelar inscripción
      </Button>
    );
  return (
    <div className="grid gap-2 rounded-lg border p-3 text-sm">
      <p>Si vuelves a inscribirte, se aplicará el precio vigente ese día.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="destructive" disabled={cancelar.isPending} onClick={() => cancelar.mutate({ inscripcionId })}>
          Sí, cancelar
        </Button>
        <Button size="sm" variant="ghost" disabled={cancelar.isPending} onClick={() => setConfirmando(false)}>
          No
        </Button>
      </div>
      {cancelar.error && (
        <p role="alert" className="text-xs text-destructive">
          {cancelar.error.message}
        </p>
      )}
    </div>
  );
}
