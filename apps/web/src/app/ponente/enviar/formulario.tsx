"use client";

import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Campo } from "~/components/campo";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input, NativeSelect, Textarea } from "~/components/ui/input";
import { propuestaSchema, RESUMEN_MAX, RESUMEN_MIN, type PropuestaInput } from "~/lib/esquemas/propuesta";
import { useTRPC } from "~/trpc/react";

export interface CongresoAbierto {
  id: string;
  nombre: string;
  cierre: string;
  areas: { id: string; nombre: string }[];
}

/** spec-001 US1: react-hook-form + el mismo esquema zod que valida el servidor (research R2). */
export function FormularioPropuesta({ congresos }: { congresos: CongresoAbierto[] }) {
  const router = useRouter();
  const trpc = useTRPC();
  const enviar = useMutation(trpc.propuesta.enviar.mutationOptions());
  const form = useForm<PropuestaInput>({
    resolver: zodResolver(propuestaSchema),
    defaultValues: { congresoId: congresos.length === 1 ? congresos[0]!.id : "", areaId: "", titulo: "", resumen: "" },
  });
  const { register, handleSubmit, watch, setValue, formState } = form;
  const congresoId = watch("congresoId");
  const resumen = watch("resumen") ?? "";
  const congreso = congresos.find((c) => c.id === congresoId);
  const err = formState.errors;

  const onSubmit = handleSubmit(async (datos) => {
    try {
      await enviar.mutateAsync(datos);
      router.push("/ponente?enviada=1");
      router.refresh();
    } catch {
      // el mensaje del servidor se muestra en la alerta (enviar.error)
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {enviar.error && <Alert variant="destructive">{enviar.error.message}</Alert>}
      <Campo id="congresoId" label="Congreso" error={err.congresoId?.message} ayuda={congreso ? `Plazo de envío hasta el ${congreso.cierre} (incluido).` : undefined}>
        <NativeSelect
          id="congresoId"
          aria-invalid={!!err.congresoId}
          {...register("congresoId", { onChange: () => setValue("areaId", "") })}
        >
          <option value="">Elige un congreso…</option>
          {congresos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} (hasta el {c.cierre})
            </option>
          ))}
        </NativeSelect>
      </Campo>
      <Campo id="areaId" label="Área temática" error={err.areaId?.message}>
        <NativeSelect id="areaId" disabled={!congreso} aria-invalid={!!err.areaId} {...register("areaId")}>
          <option value="">{congreso ? "Elige un área…" : "Primero elige un congreso"}</option>
          {congreso?.areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </NativeSelect>
      </Campo>
      <Campo id="titulo" label="Título" error={err.titulo?.message}>
        <Input id="titulo" aria-invalid={!!err.titulo} {...register("titulo")} />
      </Campo>
      <Campo id="resumen" label="Resumen" error={err.resumen?.message}>
        <Textarea id="resumen" rows={8} aria-invalid={!!err.resumen} {...register("resumen")} />
        <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {resumen.trim().length} / {RESUMEN_MAX} caracteres (mínimo {RESUMEN_MIN})
        </p>
      </Campo>
      <Button type="submit" disabled={enviar.isPending || formState.isSubmitting} className="w-fit">
        {enviar.isPending ? "Enviando…" : "Enviar propuesta"}
      </Button>
    </form>
  );
}
