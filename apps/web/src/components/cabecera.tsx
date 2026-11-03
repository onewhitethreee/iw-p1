import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ETIQUETA_ROL, ZONA_ROL } from "~/lib/roles";
import { anadirRolPropio, salir } from "~/server/acciones-auth";
import { getUsuarioActual } from "~/server/usuario-actual";

export async function Cabecera() {
  const usuario = await getUsuarioActual();
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <CalendarDays className="size-5" aria-hidden />
          Congresalia
        </Link>
        <nav aria-label="Zonas" className="flex flex-wrap gap-1">
          {usuario?.roles.map((r) => (
            <Button key={r} asChild variant="ghost" size="sm">
              <Link href={ZONA_ROL[r].href}>{ZONA_ROL[r].texto}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {usuario ? (
            <>
              <span className="hidden text-muted-foreground sm:inline" data-testid="usuario-actual">
                {usuario.nombre} · {usuario.roles.map((r) => ETIQUETA_ROL[r]).join(", ")}
              </span>
              {(["PONENTE", "ASISTENTE"] as const)
                .filter((r) => !usuario.roles.includes(r))
                .map((r) => (
                  <form key={r} action={anadirRolPropio}>
                    <input type="hidden" name="rol" value={r} />
                    <Button variant="ghost" size="sm" type="submit">
                      Quiero ser también {r === "PONENTE" ? "ponente" : "asistente"}
                    </Button>
                  </form>
                ))}
              <form action={salir}>
                <Button variant="outline" size="sm" type="submit">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/entrar">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/registro">Crear cuenta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
