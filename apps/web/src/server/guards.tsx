import "server-only";
import type { Rol } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { getUsuarioActual } from "~/server/usuario-actual";

/**
 * Protege una zona por rol en el servidor (000-core FR-004). Sin sesión redirige a /entrar;
 * con sesión pero sin rol devuelve la página «Acceso denegado». La API repite la comprobación.
 */
export async function comprobarRol(desde: string, ...roles: Rol[]): Promise<React.ReactNode | null> {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect(`/entrar?desde=${encodeURIComponent(desde)}`);
  if (!usuario.roles.some((r) => roles.includes(r))) return <AccesoDenegado />;
  return null;
}

export function AccesoDenegado() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <ShieldAlert className="size-12 text-destructive" aria-hidden />
      <h1 className="text-2xl font-semibold">Acceso denegado</h1>
      <p className="text-muted-foreground">Tu cuenta no tiene permiso para entrar en esta zona.</p>
      <Button asChild variant="outline">
        <Link href="/">Volver a la portada</Link>
      </Button>
    </div>
  );
}
