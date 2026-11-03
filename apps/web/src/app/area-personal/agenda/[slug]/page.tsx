import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { diaLocal, diaSemana, hora } from "@congresalia/domain";
import { Alert } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AccesoDenegado } from "~/server/guards";
import { api } from "~/trpc/server";
import { BotonAgenda } from "./acciones";

export const metadata: Metadata = { title: "Mi agenda" };
export const dynamic = "force-dynamic";

/** spec-005 US1 (añadir desde la sección «Programa», analyze U1) y US2 (mi agenda, quitar, aviso de solapes). */
export default async function AgendaCongresoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trpc = await api();
  let c;
  try {
    c = await trpc.congreso.porSlug({ slug });
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") notFound();
    throw e;
  }
  let programa, mia;
  try {
    [programa, mia] = await Promise.all([trpc.agenda.sesiones({ congresoId: c.id }), trpc.agenda.mia({ congresoId: c.id })]);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "FORBIDDEN") return <AccesoDenegado />;
    throw e;
  }
  const z = c.zonaHoraria;
  const porDia = new Map<string, typeof programa.sesiones>();
  for (const s of programa.sesiones) porDia.set(diaLocal(s.inicio, z), [...(porDia.get(diaLocal(s.inicio, z)) ?? []), s]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{c.nombre}</p>
        <h1 className="text-2xl font-semibold">Mi agenda</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sesiones reservadas ({mia.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {mia.length === 0 && <p className="text-sm text-muted-foreground">Todavía no has añadido sesiones.</p>}
          {mia.map((m) => (
            <div key={m.sesionId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3" data-testid="en-mi-agenda">
              <div>
                <div className="font-medium">{m.titulo}</div>
                <div className="text-sm text-muted-foreground">
                  <span className="capitalize">{diaSemana(m.inicio, z)}</span>, {hora(m.inicio, z)}–{hora(m.fin, z)} · {m.sala}
                </div>
                {m.solapaCon.length > 0 && <p className="text-xs text-destructive">Se solapa con «{m.solapaCon.join("», «")}»</p>}
              </div>
              {!m.empezada && <BotonAgenda sesionId={m.sesionId} accion="quitar" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">Programa</h2>
        {!programa.publicado && <Alert>El programa aún no se ha publicado.</Alert>}
        {[...porDia.entries()].map(([dia, lista]) => (
          <div key={dia} className="grid gap-2">
            <h3 className="font-semibold capitalize">{diaSemana(lista[0]!.inicio, z)}</h3>
            {lista.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3" data-testid="sesion-programa">
                <div>
                  <div className="font-medium">{s.titulo}</div>
                  <div className="text-sm text-muted-foreground">
                    {hora(s.inicio, z)}–{hora(s.fin, z)} · {s.sala} · {s.ponente} · {s.plazasLibres} de {s.aforo} plazas libres
                  </div>
                </div>
                {s.enAgenda ? (
                  <Badge variant="success">En tu agenda</Badge>
                ) : s.empezada ? (
                  <Badge variant="outline">Ya empezada</Badge>
                ) : s.completa ? (
                  <Badge variant="destructive">Completa</Badge>
                ) : (
                  <BotonAgenda sesionId={s.id} accion="anadir" />
                )}
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
