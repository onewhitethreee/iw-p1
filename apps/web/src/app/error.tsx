"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";

/** Converge F1 / T042: ningún error inesperado se muestra en inglés (FR-021, Constitución VI). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <AlertTriangle className="size-12 text-destructive" aria-hidden />
      <h1 className="text-2xl font-semibold">Algo ha ido mal</h1>
      <p className="text-muted-foreground">No hemos podido completar la operación. Inténtalo de nuevo dentro de un momento.</p>
      <div className="flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Button asChild variant="outline">
          <Link href="/">Volver a la portada</Link>
        </Button>
      </div>
    </div>
  );
}
