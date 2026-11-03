import { expect, test, type Page } from "@playwright/test";

async function entrar(page: Page, email: string) {
  await page.context().clearCookies(); // cambiar de usuario sin arrastrar la sesión anterior
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
  await expect(page.getByTestId("usuario-actual")).toBeVisible();
}

/** Elige en un <select> la opción cuyo texto contiene `texto`. */
async function elegir(page: Page, etiqueta: string, texto: string) {
  const select = page.getByLabel(etiqueta);
  const valor = await select.locator("option", { hasText: texto }).getAttribute("value");
  await select.selectOption(valor!);
}

const RESUMEN =
  "Presentamos los resultados de un programa de cribado auditivo neonatal en tres hospitales, con la metodología, los indicadores y las mejoras propuestas.";

test.describe("spec-001 · enviar propuesta (HU-01)", () => {
  test("US1-1: un ponente envía una propuesta válida y la ve como «Enviada»", async ({ page }) => {
    const titulo = `Cribado auditivo neonatal ${Date.now()}`;
    await entrar(page, "ponente1@congresalia.es");
    await page.goto("/ponente");
    await page.getByRole("link", { name: "Enviar propuesta" }).click();
    await elegir(page, "Congreso", "Jornadas de Pediatría 2027");
    await expect(page.getByText(/Plazo de envío hasta el .* \(incluido\)/)).toBeVisible();
    await elegir(page, "Área temática", "Neonatología");
    await page.getByLabel("Título").fill(titulo);
    await page.getByLabel("Resumen").fill(RESUMEN);
    await page.getByRole("button", { name: "Enviar propuesta" }).click();
    await expect(page).toHaveURL(/\/ponente\?enviada=1$/);
    await expect(page.getByText("Propuesta enviada.")).toBeVisible();
    const fila = page.getByTestId("fila-propuesta").first();
    await expect(fila).toContainText(titulo);
    await expect(fila).toContainText("Enviada");
  });

  test("US1-4: un resumen demasiado corto muestra el error del campo y no se envía", async ({ page }) => {
    await entrar(page, "ponente2@congresalia.es");
    await page.goto("/ponente/enviar");
    await elegir(page, "Congreso", "Jornadas de Pediatría 2027");
    await elegir(page, "Área temática", "Pediatría general");
    await page.getByLabel("Título").fill("Título correcto");
    await page.getByLabel("Resumen").fill("Demasiado corto");
    await page.getByRole("button", { name: "Enviar propuesta" }).click();
    await expect(page.getByText("El resumen debe tener entre 100 y 3000 caracteres")).toBeVisible();
    await expect(page).toHaveURL(/\/ponente\/enviar$/);
  });

  test("US1-6: un asistente ve «Acceso denegado» y un visitante sin sesión va a entrar", async ({ page }) => {
    await page.goto("/ponente/enviar");
    await expect(page).toHaveURL(/\/entrar\?desde=%2Fponente/);
    await entrar(page, "asistente1@congresalia.es");
    await page.goto("/ponente/enviar");
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });

  test("US2-1/US2-2: el ponente ve sus propuestas en los cuatro estados y ninguna de otro ponente", async ({ page }) => {
    await entrar(page, "ponente1@congresalia.es");
    await page.goto("/ponente");
    for (const estado of ["Enviada", "En evaluación", "Aceptada"]) {
      await expect(page.getByTestId("fila-propuesta").filter({ hasText: estado }).first()).toBeVisible();
    }
    // ponente1 no tiene rechazadas en el seed; ponente2 sí
    await expect(page.getByText("Cuidados centrados en el desarrollo en la UCI neonatal")).toHaveCount(0);
    await entrar(page, "ponente2@congresalia.es");
    await page.goto("/ponente");
    await expect(page.getByTestId("fila-propuesta").filter({ hasText: "Rechazada" })).toBeVisible();
    await expect(page.getByText("Método canguro en prematuros extremos")).toHaveCount(0);
  });

  test("US2-5: un ponente sin propuestas ve el mensaje de lista vacía", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Nombre y apellidos").fill("Ponente Nuevo");
    await page.getByLabel("Correo electrónico").fill(`nuevo-${Date.now()}@test.es`);
    await page.getByLabel("Contraseña").fill("secreta123");
    await page.getByLabel("Me registro como").selectOption("PONENTE");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByTestId("usuario-actual")).toBeVisible();
    await page.goto("/ponente");
    await expect(page.getByText("Todavía no has enviado ninguna propuesta.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Enviar propuesta" })).toBeVisible();
  });
});
