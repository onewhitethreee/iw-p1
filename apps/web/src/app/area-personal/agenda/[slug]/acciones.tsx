"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/react";

/** Añadir / quitar con un clic (SC-003); el servidor aplica todas las reglas. */
export function BotonAgenda({ sesionId, accion }: { sesionId: string; accion: "anadir" | "quitar" }) {
  const router = useRouter();
  const trpc = useTRPC();
  const opciones = { onSuccess: () => router.refresh() };
  const anadir = useMutation(trpc.agenda.anadir.mutationOptions(opciones));
  const quitar = useMutation(trpc.agenda.quitar.mutationOptions(opciones));
  const m = accion === "anadir" ? anadir : quitar;
  return (
    <div className="grid justify-items-end gap-1">
      <Button size="sm" variant={accion === "anadir" ? "default" : "outline"} disabled={m.isPending} onClick={() => m.mutate({ sesionId })}>
        {accion === "anadir" ? "Añadir" : "Quitar"}
      </Button>
      {m.error && (
        <p role="alert" className="max-w-xs text-right text-xs text-destructive">
          {m.error.message}
        </p>
      )}
    </div>
  );
}
