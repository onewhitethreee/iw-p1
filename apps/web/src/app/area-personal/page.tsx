import type { Metadata } from "next";
import Link from "next/link";
import { ETIQUETA_TIPO_ASISTENTE, euros, fecha } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";

export const metadata: Metadata = { title: "Área personal" };
export const dynamic = "force-dynamic";

/** spec-004 US2-1/US2-5: mis inscripciones; QR de acreditación solo si está confirmada. */
export default async function AreaPersonalPage({ searchParams }: { searchParams: Promise<{ pagada?: string }> }) {
  const { pagada } = await searchParams;
  const inscripciones = await (await api()).inscripcion.mias();
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Área personal</h1>
      {pagada && <Alert variant="success">Pago aprobado. Tu inscripción está confirmada.</Alert>}
      {inscripciones.length === 0 && (
        <p className="text-muted-foreground">
          No tienes inscripciones. Elige un congreso en la{" "}
          <Link className="underline" href="/">
            portada
          </Link>
          .
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {inscripciones.map((i) => (
          <Card key={i.id} data-testid="inscripcion">
            <CardHeader>
              {i.estado === "CONFIRMADA" ? <Badge variant="success">Confirmada</Badge> : <Badge variant="warning">Pendiente de pago</Badge>}
              <CardTitle>{i.congreso.nombre}</CardTitle>
              <CardDescription>
                {ETIQUETA_TIPO_ASISTENTE[i.tipoAsistente]} · tarifa {i.tarifaAplicada === "TEMPRANA" ? "temprana" : "general"} · {euros(i.importeCent)} · inscrita el{" "}
                {fecha(i.creadaEn, i.congreso.zonaHoraria)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {i.qr ? (
                <div className="grid justify-items-center gap-2 rounded-lg border p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL generada en el servidor */}
                  <img src={i.qr} alt="Código QR de acreditación" width={220} height={220} />
                  <p className="text-xs text-muted-foreground">Muestra este QR en la entrada de cada sala.</p>
                  <code className="text-[10px] text-muted-foreground">{i.codigo}</code>
                </div>
              ) : (
                <Button asChild className="w-fit">
                  <Link href={`/area-personal/pago/${i.id}`}>Pagar {euros(i.importeCent)}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
