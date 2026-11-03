import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormularioRegistro } from "./formulario";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ desde?: string; rol?: string }> }) {
  const { desde = "/", rol } = await searchParams;
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Crear cuenta</CardTitle>
        <CardDescription>Solo pedimos los datos imprescindibles.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormularioRegistro desde={desde} rolInicial={rol === "PONENTE" ? "PONENTE" : "ASISTENTE"} />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-primary underline" href={`/entrar?desde=${encodeURIComponent(desde)}`}>
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
