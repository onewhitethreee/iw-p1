"use client";

import { useActionState } from "react";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Campo } from "~/components/campo";
import { entrar, type EstadoFormulario } from "~/server/acciones-auth";

export function FormularioEntrar({ desde }: { desde: string }) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(entrar, {});
  return (
    <form action={accion} className="grid gap-4">
      <input type="hidden" name="desde" value={desde} />
      {estado.error && <Alert variant="destructive">{estado.error}</Alert>}
      <Campo id="email" label="Correo electrónico">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Campo>
      <Campo id="password" label="Contraseña">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Campo>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
