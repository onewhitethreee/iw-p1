"use client";

import { useActionState } from "react";
import { Alert } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input, NativeSelect } from "~/components/ui/input";
import { Campo } from "~/components/campo";
import { registrar, type EstadoFormulario } from "~/server/acciones-auth";

export function FormularioRegistro({ desde, rolInicial }: { desde: string; rolInicial: "PONENTE" | "ASISTENTE" }) {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(registrar, {});
  const err = (c: string) => estado.campos?.[c]?.[0];
  return (
    <form action={accion} className="grid gap-4" noValidate>
      <input type="hidden" name="desde" value={desde} />
      {estado.error && <Alert variant="destructive">{estado.error}</Alert>}
      <Campo id="nombre" label="Nombre y apellidos" error={err("nombre")}>
        <Input id="nombre" name="nombre" autoComplete="name" required aria-invalid={!!err("nombre")} />
      </Campo>
      <Campo id="email" label="Correo electrónico" error={err("email")}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!err("email")} />
      </Campo>
      <Campo id="password" label="Contraseña" error={err("password")} ayuda="Mínimo 8 caracteres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required aria-invalid={!!err("password")} />
      </Campo>
      <Campo id="rol" label="Me registro como" error={err("rol")}>
        <NativeSelect id="rol" name="rol" defaultValue={rolInicial}>
          <option value="ASISTENTE">Asistente (quiero inscribirme en congresos)</option>
          <option value="PONENTE">Ponente (quiero enviar propuestas)</option>
        </NativeSelect>
      </Campo>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
