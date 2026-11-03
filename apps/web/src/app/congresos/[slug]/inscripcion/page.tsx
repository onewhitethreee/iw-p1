import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { congresoFinalizado, ETIQUETA_TIPO_ASISTENTE, euros, fecha } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { anadirRolPropio } from "~/server/acciones-auth";
import { getUsuarioActual } from "~/server/usuario-actual";
import { api } from "~/trpc/server";
import { FormularioInscripcion } from "./formulario";

export const metadata: Metadata = { title: "Inscripción", robots: { index: false } };
export const dynamic = "force-dynamic";

/** spec-004 US1: precios vigentes y formulario; casos sin sesión, sin rol y ya inscrito. */
export default async function InscripcionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trpc = await api();
  let c;
  try {
    c = await trpc.congreso.porSlug({ slug });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  const [precios, usuario] = await Promise.all([trpc.inscripcion.presupuesto({ congresoId: c.id }), getUsuarioActual()]);
  const esAsistente = usuario?.roles.includes("ASISTENTE") ?? false;
  const yaInscrito = esAsistente ? (await trpc.inscripcion.mias()).find((i) => i.congreso.slug === slug) : undefined;
  const desde = encodeURIComponent(`/congresos/${slug}/inscripcion`);

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">Inscripción · {c.nombre}</CardTitle>
        <CardDescription>
          {precios.tarifaAplicada === "TEMPRANA"
            ? `Precio reducido hasta el ${fecha(precios.limiteTemprana, c.zonaHoraria)} (incluido).`
            : "Precio general (el plazo de inscripción temprana ha terminado)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ul className="grid gap-1 text-sm" data-testid="precios">
          {precios.tipos.map((t) => (
            <li key={t.tipoAsistente} className="flex justify-between border-b py-1">
              <span>{ETIQUETA_TIPO_ASISTENTE[t.tipoAsistente]}</span>
              <span className="font-medium tabular-nums">{euros(t.importeCent)}</span>
            </li>
          ))}
        </ul>
        {congresoFinalizado(c, new Date()) ? (
          <Alert variant="warning">El congreso ha finalizado: ya no se admiten inscripciones.</Alert>
        ) : !usuario ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/registro?rol=ASISTENTE&desde=${desde}`}>Crear cuenta para inscribirme</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/entrar?desde=${desde}`}>Ya tengo cuenta</Link>
            </Button>
          </div>
        ) : !esAsistente ? (
          <form action={anadirRolPropio} className="grid gap-2">
            <p className="text-sm text-muted-foreground">Tu cuenta no tiene el rol de asistente.</p>
            <input type="hidden" name="rol" value="ASISTENTE" />
            <Button type="submit" className="w-fit">
              Añadirme como asistente
            </Button>
          </form>
        ) : yaInscrito ? (
          <Alert>
            Ya tienes una inscripción en este congreso.{" "}
            <Link className="underline" href="/area-personal">
              Ir a mi área personal
            </Link>
          </Alert>
        ) : (
          <FormularioInscripcion congresoId={c.id} tipos={precios.tipos.map((t) => ({ ...t, etiqueta: `${ETIQUETA_TIPO_ASISTENTE[t.tipoAsistente]} · ${euros(t.importeCent)}` }))} />
        )}
      </CardContent>
    </Card>
  );
}
