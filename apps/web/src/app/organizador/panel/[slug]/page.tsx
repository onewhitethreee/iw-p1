import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Panel } from "./panel";

export const metadata: Metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

/** spec-008: panel de un congreso; los datos se cargan y refrescan en el cliente cada 5 s. */
export default async function PanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const caller = await api();
  const congreso = await caller.congreso.porSlug({ slug }).catch(() => null);
  if (!congreso) notFound();
  const inicial = await caller.panel.resumen({ congresoId: congreso.id });
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <Link href="/organizador/panel" className="text-sm text-muted-foreground hover:underline">
          ← Congresos
        </Link>
        <h1 className="text-2xl font-semibold">{congreso.nombre}</h1>
      </div>
      <Panel congresoId={congreso.id} zona={congreso.zonaHoraria} inicial={inicial} />
    </div>
  );
}
