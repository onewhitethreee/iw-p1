import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "~/components/ui/button";

/** 404 en español (analyze D1, 000-core US2 escenario 2). */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <SearchX className="size-12 text-muted-foreground" aria-hidden />
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground">La dirección no corresponde a ningún congreso ni página de Congresalia.</p>
      <Button asChild variant="outline">
        <Link href="/">Volver a la portada</Link>
      </Button>
    </div>
  );
}
