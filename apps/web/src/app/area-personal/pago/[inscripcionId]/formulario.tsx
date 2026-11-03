"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Campo } from "~/components/campo";
import { useTRPC } from "~/trpc/react";

export function FormularioPago({ inscripcionId, importe }: { inscripcionId: string; importe: string }) {
  const router = useRouter();
  const trpc = useTRPC();
  const [tarjeta, setTarjeta] = useState("");
  const pagar = useMutation(
    trpc.inscripcion.pagar.mutationOptions({
      onSuccess: (r) => {
        if (r.resultado === "APROBADO") router.push("/area-personal?pagada=1");
      },
    }),
  );
  const rechazado = pagar.data?.resultado === "RECHAZADO";
  return (
    <div className="grid gap-4">
      {pagar.error && <Alert variant="destructive">{pagar.error.message}</Alert>}
      {rechazado && <Alert variant="destructive">{pagar.data!.mensaje}</Alert>}
      <Campo id="tarjeta" label="Número de tarjeta" ayuda="Pago simulado: no se cobra nada. Tarjeta de prueba que se rechaza: 4000 0000 0000 0002.">
        <Input id="tarjeta" inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012 3456" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)} />
      </Campo>
      <Button className="w-fit" disabled={!tarjeta || pagar.isPending} onClick={() => pagar.mutate({ inscripcionId, tarjeta })}>
        {pagar.isPending ? "Procesando…" : `Pagar ${importe}`}
      </Button>
    </div>
  );
}
