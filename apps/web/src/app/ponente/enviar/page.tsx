import type { Metadata } from "next";
import Link from "next/link";
import { fecha } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";
import { FormularioPropuesta, type CongresoAbierto } from "./formulario";

export const metadata: Metadata = { title: "Enviar propuesta" };

/** spec-001 FR-007: solo congresos con la llamada abierta, con su día de cierre. */
export default async function EnviarPropuestaPage() {
  const trpc = await api();
  const abiertos = (await trpc.congreso.listar()).filter((c) => c.fase === "LLAMADA_ABIERTA");
  const congresos: CongresoAbierto[] = await Promise.all(
    abiertos.map(async (c) => {
      const detalle = await trpc.congreso.porSlug({ slug: c.slug });
      return {
        id: c.id,
        nombre: c.nombre,
        // envioCierra es exclusivo (00:00 del día siguiente): el último día es el anterior (FR-005a)
        cierre: fecha(new Date(c.envioCierra.getTime() - 1), c.zonaHoraria),
        areas: detalle.areas,
      };
    }),
  );

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Enviar propuesta de ponencia</CardTitle>
        <CardDescription>El comité científico evaluará tu propuesta de forma anónima.</CardDescription>
      </CardHeader>
      <CardContent>
        {congresos.length === 0 ? (
          <div className="grid gap-4">
            <Alert>Ahora mismo no hay ningún congreso con la llamada a comunicaciones abierta.</Alert>
            <Button asChild variant="outline" className="w-fit">
              <Link href="/ponente">Volver a mis propuestas</Link>
            </Button>
          </div>
        ) : (
          <FormularioPropuesta congresos={congresos} />
        )}
      </CardContent>
    </Card>
  );
}
