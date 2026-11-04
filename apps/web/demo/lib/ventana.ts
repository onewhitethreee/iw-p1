import type { Page } from "@playwright/test";
import { CLAVE } from "./escena";

/** Utilidades para las ventanas secundarias (no grabadas): otro usuario actuando a la vez. */
export async function entrarEn(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(CLAVE);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByTestId("usuario-actual").waitFor();
}

/** Llama a un procedimiento tRPC con la sesión de esa ventana. Devuelve estado y mensaje. */
export async function trpcEn(page: Page, proc: string, input: unknown) {
  return page.evaluate(
    async ({ proc, input }) => {
      const res = await fetch(`/api/trpc/${proc}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ json: input }) });
      const j = (await res.json()) as { error?: { json?: { message?: string } } };
      return { status: res.status, mensaje: j.error?.json?.message ?? "OK" };
    },
    { proc, input },
  );
}

/** "HH:mm" y "aaaa-mm-dd" en la zona del congreso. */
export const horaLocal = (d: Date) => new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
export const diaLocal = (d: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(d);
