"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { NativeSelect } from "~/components/ui/input";
import { Campo } from "~/components/campo";
import { useTRPC } from "~/trpc/react";

type Tipo = "PROFESIONAL" | "SOCIO" | "ESTUDIANTE";

export function FormularioInscripcion({ congresoId, tipos }: { congresoId: string; tipos: { tipoAsistente: Tipo; etiqueta: string }[] }) {
  const router = useRouter();
  const trpc = useTRPC();
  const crear = useMutation(trpc.inscripcion.crear.mutationOptions({ onSuccess: (r) => router.push(`/area-personal/pago/${r.id}`) }));
  const [tipo, setTipo] = useState<Tipo | "">("");
  return (
    <div className="grid gap-3">
      {crear.error && <Alert variant="destructive">{crear.error.message}</Alert>}
      <Campo id="tipo" label="Tipo de asistente">
        <NativeSelect id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
          <option value="">Elige…</option>
          {tipos.map((t) => (
            <option key={t.tipoAsistente} value={t.tipoAsistente}>
              {t.etiqueta}
            </option>
          ))}
        </NativeSelect>
      </Campo>
      <Button className="w-fit" disabled={!tipo || crear.isPending} onClick={() => tipo && crear.mutate({ congresoId, tipoAsistente: tipo })}>
        {crear.isPending ? "Inscribiendo…" : "Inscribirme"}
      </Button>
    </div>
  );
}
