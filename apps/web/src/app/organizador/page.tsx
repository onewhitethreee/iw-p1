import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

// Índice de la zona de organización: cada spec (002, 003, 008) añade aquí su acceso.
export default function Page() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Organización</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/organizador/panel">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="size-5" aria-hidden /> Panel
              </CardTitle>
              <CardDescription>Inscripciones, ingresos y ocupación de cada sesión en tiempo real.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
