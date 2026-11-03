"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, CameraOff, CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Campo } from "~/components/campo";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/react";

type Ocupacion = { asistencias: number; aforo: number };
type Respuesta = { resultado: "ADMITIDO" | "YA_REGISTRADO" | "RECHAZADO"; motivo: string; asistente: string | null };

/** Tras una lectura de la cámara se ignoran las siguientes durante 2 s (plan R5). */
const PAUSA_MS = 2_000;

const ESTILO = {
  ADMITIDO: { clase: "border-success bg-success/15 text-success", Icono: CircleCheck, titulo: "Admitido" },
  YA_REGISTRADO: { clase: "border-warning bg-warning/20 text-foreground", Icono: CircleAlert, titulo: "Ya registrado" },
  RECHAZADO: { clase: "border-destructive bg-destructive/10 text-destructive", Icono: CircleX, titulo: "Rechazado" },
} as const;

/** Puerta de la sesión: cámara (html5-qrcode), código manual, resultado y ocupación (FR-002, FR-006, FR-007). */
export function Escaner({ sesionId, inicial }: { sesionId: string; inicial: Ocupacion }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [codigo, setCodigo] = useState("");
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [camara, setCamara] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const ultimaLectura = useRef(0);

  // US2: la ocupación se refresca cada 3 s para ver también lo que entra por otras puertas (R4)
  const opcionesOcupacion = trpc.acreditacion.ocupacion.queryOptions({ sesionId });
  const ocupacion = useQuery({ ...opcionesOcupacion, initialData: inicial, refetchInterval: 3_000 });

  const escanear = useMutation(
    trpc.acreditacion.escanear.mutationOptions({
      onSuccess: (r) => {
        setRespuesta(r);
        queryClient.setQueryData(opcionesOcupacion.queryKey, r.ocupacion);
      },
    }),
  );
  const { mutate } = escanear;

  const validar = useCallback(
    (texto: string) => {
      if (!texto.trim()) return;
      mutate({ sesionId, codigo: texto });
    },
    [mutate, sesionId],
  );

  useEffect(() => {
    if (!camara) return;
    let lector: { stop: () => Promise<void>; isScanning: boolean } | null = null;
    let cancelado = false;
    void (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelado) return;
        const l = new Html5Qrcode("lector-qr");
        lector = l;
        await l.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (texto) => {
            const t = Date.now();
            if (t - ultimaLectura.current < PAUSA_MS) return;
            ultimaLectura.current = t;
            validar(texto);
          },
          () => undefined,
        );
      } catch {
        setErrorCamara("No se puede usar la cámara. Escribe el código de la acreditación.");
        setCamara(false);
      }
    })();
    return () => {
      cancelado = true;
      if (lector?.isScanning) void lector.stop();
    };
  }, [camara, validar]);

  const { asistencias, aforo } = ocupacion.data;
  const estilo = respuesta ? ESTILO[respuesta.resultado] : null;

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border p-4 text-center" aria-live="polite">
        <p className="text-sm text-muted-foreground">Ocupación</p>
        <p className="text-3xl font-semibold tabular-nums" data-testid="ocupacion">
          {asistencias} / {aforo}
        </p>
        <p className="text-sm text-muted-foreground">quedan {Math.max(aforo - asistencias, 0)}</p>
      </div>

      {respuesta && estilo && (
        <div role="status" data-testid="resultado" className={cn("flex items-center gap-4 rounded-lg border-2 p-5", estilo.clase)}>
          <estilo.Icono className="size-12 shrink-0" aria-hidden />
          <div className="grid gap-0.5">
            <p className="text-2xl font-bold">{estilo.titulo}</p>
            {respuesta.resultado === "RECHAZADO" && <p className="text-lg">{respuesta.motivo}</p>}
            {respuesta.asistente && <p className="text-lg">{respuesta.asistente}</p>}
          </div>
        </div>
      )}
      {escanear.error && (
        <p role="alert" className="text-sm text-destructive">
          {escanear.error.message}
        </p>
      )}

      <div className="grid gap-2">
        <div id="lector-qr" className={cn("overflow-hidden rounded-lg", !camara && "hidden")} />
        <Button type="button" variant="outline" onClick={() => { setErrorCamara(null); setCamara((v) => !v); }}>
          {camara ? <CameraOff aria-hidden /> : <Camera aria-hidden />}
          {camara ? "Detener la cámara" : "Escanear con la cámara"}
        </Button>
        {errorCamara && <p className="text-sm text-muted-foreground">{errorCamara}</p>}
      </div>

      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          validar(codigo);
          setCodigo("");
        }}
      >
        <Campo id="codigo" label="Código de acreditación" ayuda="Si el QR no se lee, escribe el código que aparece bajo él.">
          <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" autoCapitalize="none" spellCheck={false} />
        </Campo>
        <Button type="submit" disabled={escanear.isPending || !codigo.trim()}>
          Validar
        </Button>
      </form>
    </div>
  );
}
