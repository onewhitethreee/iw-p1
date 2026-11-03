import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ETIQUETA_TIPO_ASISTENTE, euros } from "@congresalia/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { AccesoDenegado } from "~/server/guards";
import { api } from "~/trpc/server";
import { FormularioPago } from "./formulario";

export const metadata: Metadata = { title: "Pago" };
export const dynamic = "force-dynamic";

/** spec-004 US2: pasarela simulada (A5, clarify P3). Solo el propietario ve su inscripción. */
export default async function PagoPage({ params }: { params: Promise<{ inscripcionId: string }> }) {
  const { inscripcionId } = await params;
  const ins = (await (await api()).inscripcion.mias()).find((i) => i.id === inscripcionId);
  if (!ins) return <AccesoDenegado />;
  if (ins.estado === "CONFIRMADA") redirect("/area-personal");
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Pasarela de pago (simulada)</CardTitle>
        <CardDescription>
          {ins.congreso.nombre} · {ETIQUETA_TIPO_ASISTENTE[ins.tipoAsistente]} · tarifa {ins.tarifaAplicada === "TEMPRANA" ? "temprana" : "general"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormularioPago inscripcionId={ins.id} importe={euros(ins.importeCent)} />
      </CardContent>
    </Card>
  );
}
