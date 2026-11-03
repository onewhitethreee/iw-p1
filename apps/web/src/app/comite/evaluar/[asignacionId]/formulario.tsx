"use client";

import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { PUNTUACION_MAX, PUNTUACION_MIN } from "@congresalia/domain";
import { Campo } from "~/components/campo";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { NativeSelect, Textarea } from "~/components/ui/input";
import { COMENTARIOS_MAX, COMENTARIOS_MIN, evaluacionSchema } from "~/lib/esquemas/evaluacion";
import { useTRPC } from "~/trpc/react";

type Entrada = z.input<typeof evaluacionSchema>;
type Salida = z.output<typeof evaluacionSchema>;

export function FormularioEvaluacion({
  asignacionId,
  inicial,
  soloLectura,
}: {
  asignacionId: string;
  inicial: { puntuacion: number; comentarios: string } | null;
  soloLectura: boolean;
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const evaluar = useMutation(trpc.evaluacion.evaluar.mutationOptions());
  const [guardada, setGuardada] = useState(false);
  const { register, handleSubmit, watch, formState } = useForm<Entrada, unknown, Salida>({
    resolver: zodResolver(evaluacionSchema),
    defaultValues: { asignacionId, puntuacion: inicial?.puntuacion, comentarios: inicial?.comentarios ?? "" },
  });
  const comentarios = String(watch("comentarios") ?? "");
  const err = formState.errors;

  const onSubmit = handleSubmit(async (datos) => {
    setGuardada(false);
    try {
      await evaluar.mutateAsync(datos);
      setGuardada(true);
      router.refresh();
    } catch {
      // mensaje del servidor en evaluar.error
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {evaluar.error && <Alert variant="destructive">{evaluar.error.message}</Alert>}
      {guardada && <Alert variant="success">Evaluación guardada.</Alert>}
      <input type="hidden" {...register("asignacionId")} />
      <Campo id="puntuacion" label={`Puntuación (${PUNTUACION_MIN} a ${PUNTUACION_MAX})`} error={err.puntuacion?.message}>
        <NativeSelect id="puntuacion" disabled={soloLectura} aria-invalid={!!err.puntuacion} className="w-40" {...register("puntuacion")}>
          <option value="">Elige…</option>
          {Array.from({ length: PUNTUACION_MAX - PUNTUACION_MIN + 1 }, (_, i) => PUNTUACION_MIN + i).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </NativeSelect>
      </Campo>
      <Campo id="comentarios" label="Comentarios" error={err.comentarios?.message}>
        <Textarea id="comentarios" rows={6} disabled={soloLectura} aria-invalid={!!err.comentarios} {...register("comentarios")} />
        <p className="text-xs text-muted-foreground tabular-nums">
          {comentarios.trim().length} / {COMENTARIOS_MAX} caracteres (mínimo {COMENTARIOS_MIN})
        </p>
      </Campo>
      {!soloLectura && (
        <Button type="submit" className="w-fit" disabled={evaluar.isPending}>
          {evaluar.isPending ? "Guardando…" : inicial ? "Actualizar evaluación" : "Guardar evaluación"}
        </Button>
      )}
    </form>
  );
}
