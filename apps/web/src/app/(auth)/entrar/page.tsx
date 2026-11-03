import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ desde?: string }> }) {
  const { desde = "/" } = await searchParams;
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>Accede con tu correo y contraseña.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormularioEntrar desde={desde} />
        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link className="text-primary underline" href={`/registro?desde=${encodeURIComponent(desde)}`}>
            Crear una
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
