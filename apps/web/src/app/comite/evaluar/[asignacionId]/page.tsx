import type { Metadata } from "next";
import Link from "next/link";
import { TRPCError } from "@trpc/server";
import { estaDecidida } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { EstadoPropuestaBadge } from "~/components/estado-propuesta";
import { AccesoDenegado } from "~/server/guards";
import { api } from "~/trpc/server";
import { FormularioEvaluacion } from "./formulario";

export const metadata: Metadata = { title: "Evaluar propuesta" };

/** spec-002 US1-2…US1-6: propuesta sin autor + formulario; solo lectura si está decidida. */
export default async function EvaluarPage({ params }: { params: Promise<{ asignacionId: string }> }) {
  const { asignacionId } = await params;
  let d;
  try {
    d = await (await api()).evaluacion.detalle({ asignacionId });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "FORBIDDEN") return <AccesoDenegado />;
    throw e;
  }
  const decidida = estaDecidida(d.propuesta.estado);
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <Button asChild variant="link" className="w-fit px-0">
        <Link href="/comite">← Mis evaluaciones</Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <EstadoPropuestaBadge estado={d.propuesta.estado} />
            <span className="text-sm text-muted-foreground">
              {d.propuesta.congreso.nombre} · {d.propuesta.area.nombre}
            </span>
          </div>
          <CardTitle className="text-xl" data-testid="titulo-propuesta">
            {d.propuesta.titulo}
          </CardTitle>
          <CardDescription>Revisión anónima: la autoría no se muestra.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line leading-relaxed">{d.propuesta.resumen}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mi evaluación</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {decidida && <Alert variant="warning">La propuesta ya está decidida: tu evaluación no se puede modificar.</Alert>}
          <FormularioEvaluacion asignacionId={asignacionId} inicial={d.evaluacion} soloLectura={decidida} />
        </CardContent>
      </Card>
    </div>
  );
}
