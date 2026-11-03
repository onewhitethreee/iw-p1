import Link from "next/link";
import { Award } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

// Índice del área personal: cada spec (004, 005, 007) añade aquí su acceso.
export default function Page() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Área personal</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/area-personal/certificado">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-5" aria-hidden /> Certificado
              </CardTitle>
              <CardDescription>Tu porcentaje de asistencia y el certificado en PDF.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
