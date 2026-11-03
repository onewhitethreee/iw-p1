import { expect, test, type Page } from "@playwright/test";

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

const PEDIATRIA = "/organizador/jornadas-pediatria-2027/propuestas";
const fila = (page: Page, titulo: string) => page.getByTestId("fila-propuesta-org").filter({ hasText: titulo });

test.describe.serial("spec-002 · evaluar propuestas (HU-02)", () => {
  test("US1-1/US1-2 + SC-001: comite1 evalúa sin ver al autor", async ({ page }) => {
    await entrar(page, "comite1@congresalia.es");
    await page.goto("/comite");
    const f = page.getByTestId("fila-asignacion").filter({ hasText: "Uso racional de antibióticos" });
    await expect(f).toContainText("Pendiente");
    await expect(page.getByText("Paula Ponente")).toHaveCount(0);
    await f.getByRole("link", { name: "Evaluar" }).click();
    await expect(page.getByTestId("titulo-propuesta")).toHaveText("Uso racional de antibióticos en otitis media");
    await expect(page.getByText("Paula Ponente")).toHaveCount(0);

    // US1-3: comentario demasiado corto
    await page.getByLabel(/Puntuación/).selectOption("8");
    await page.getByLabel("Comentarios").fill("Corto");
    await page.getByRole("button", { name: "Guardar evaluación" }).click();
    await expect(page.getByText("Los comentarios deben tener entre 10 y 2000 caracteres")).toBeVisible();

    await page.getByLabel("Comentarios").fill("Buen planteamiento clínico, conviene detallar la muestra.");
    await page.getByRole("button", { name: "Guardar evaluación" }).click();
    await expect(page.getByText("Evaluación guardada.")).toBeVisible();
    await page.goto("/comite");
    await expect(page.getByTestId("fila-asignacion").filter({ hasText: "Uso racional de antibióticos" })).toContainText("Evaluada (8)");
  });

  test("US2-1: el organizador asigna «Bronquiolitis…» a comite3 y pasa a «En evaluación»", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await page.goto(PEDIATRIA);
    const f = fila(page, "Bronquiolitis");
    await expect(f).toContainText("Enviada");
    await f.getByLabel("Asignar evaluador").selectOption({ label: "Clara Comité" });
    await f.getByRole("button", { name: "Asignar" }).click();
    await expect(f).toContainText("En evaluación");
    await expect(f).toContainText("Clara Comité");
  });

  test("US2-2: no se puede asignar una propuesta a su propio autor", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await page.goto(PEDIATRIA);
    const f = fila(page, "Alimentación complementaria");
    await f.getByLabel("Asignar evaluador").selectOption({ label: "Pedro Ponente-Comité" });
    await f.getByRole("button", { name: "Asignar" }).click();
    await expect(f.getByRole("alert")).toHaveText("Un evaluador no puede evaluar su propia propuesta");
    await expect(f).toContainText("Enviada");
  });

  test("US3-2: no se puede aceptar con menos de 2 evaluaciones (lo rechaza el servidor)", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await page.goto(PEDIATRIA);
    const f = fila(page, "Obesidad infantil");
    await expect(f).toContainText("Faltan 2 evaluaciones");
    await f.getByRole("button", { name: "Aceptar" }).click();
    await expect(f.getByRole("alert")).toHaveText("Se necesitan al menos 2 evaluaciones (tiene 0)");
    await expect(f).toContainText("En evaluación");
  });

  test("US3-1/US3-4: aceptar «Método canguro…» (media 8,5) y ordenar por media", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await page.goto(`${PEDIATRIA}?orden=media`);
    const f = fila(page, "Método canguro");
    await expect(f).toContainText("8,5");
    await expect(f).toContainText("Pablo Ponente"); // el organizador sí ve al autor
    await f.getByRole("button", { name: "Aceptar" }).click();
    await expect(f).toContainText("Aceptada");
    await expect(f.getByRole("button", { name: "Aceptar" })).toHaveCount(0);
  });

  test("US1-6: comite1 ya no puede modificar la evaluación de una propuesta decidida", async ({ page }) => {
    await entrar(page, "comite1@congresalia.es");
    await page.goto("/comite");
    await page.getByTestId("fila-asignacion").filter({ hasText: "Método canguro" }).getByRole("link", { name: "Ver" }).click();
    await expect(page.getByText("La propuesta ya está decidida: tu evaluación no se puede modificar.")).toBeVisible();
    await expect(page.getByLabel(/Puntuación/)).toBeDisabled();
    await expect(page.getByRole("button", { name: /evaluación/ })).toHaveCount(0);
  });

  test("Permisos: un asistente no entra en la zona del comité", async ({ page }) => {
    await entrar(page, "asistente1@congresalia.es");
    await page.goto("/comite");
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });
});
