import { expect, test, type Page } from "@playwright/test";

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

const sesion = (page: Page, titulo: string) => page.getByTestId("sesion-programa").filter({ hasText: titulo });

test.describe.serial("spec-005 · agenda personal (HU-05)", () => {
  test("US1-1/US1-2/US2-2: añadir, solape rechazado y quitar", async ({ page }) => {
    await entrar(page, "asistente3@congresalia.es");
    await page.goto("/area-personal/agenda");
    await page.getByTestId("congreso-agenda").filter({ hasText: "Innovación Educativa" }).click();
    await expect(page.getByText("Todavía no has añadido sesiones.")).toBeVisible();

    await sesion(page, "Gamificación con recursos abiertos").getByRole("button", { name: "Añadir" }).click();
    await expect(page.getByTestId("en-mi-agenda").filter({ hasText: "Gamificación con recursos abiertos" })).toBeVisible();
    await expect(sesion(page, "Gamificación con recursos abiertos")).toContainText("En tu agenda");

    await sesion(page, "Evaluación formativa con portafolios").getByRole("button", { name: "Añadir" }).click();
    await expect(sesion(page, "Evaluación formativa con portafolios").getByRole("alert")).toContainText("Se solapa con «Gamificación con recursos abiertos»");

    await page.getByTestId("en-mi-agenda").filter({ hasText: "Gamificación" }).getByRole("button", { name: "Quitar" }).click();
    await expect(page.getByText("Todavía no has añadido sesiones.")).toBeVisible();
  });

  test("Estados: una sesión empezada no ofrece «Añadir»", async ({ page }) => {
    await entrar(page, "asistente3@congresalia.es");
    await page.goto("/area-personal/agenda/congreso-innovacion-educativa-2026");
    const rubricas = sesion(page, "Rúbricas compartidas");
    await expect(rubricas).toContainText("Ya empezada");
    await expect(rubricas.getByRole("button", { name: "Añadir" })).toHaveCount(0);
  });

  test("US1-6: con la inscripción pendiente no hay agenda", async ({ page }) => {
    await entrar(page, "asistente4@congresalia.es");
    await page.goto("/area-personal/agenda");
    await expect(page.getByText("No tienes inscripciones confirmadas.", { exact: false })).toBeVisible();
    await page.goto("/area-personal/agenda/congreso-innovacion-educativa-2026");
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });
});
