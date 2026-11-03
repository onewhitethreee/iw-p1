import { expect, test } from "@playwright/test";

test.describe("000-core · base común", () => {
  test("US2: la portada muestra los congresos del seed sin iniciar sesión", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Congresos de salud y educación" })).toBeVisible();
    await expect(page.getByTestId("tarjeta-congreso")).toHaveCount(3);
    await expect(page.getByText("Llamada a comunicaciones abierta")).toBeVisible();
    await expect(page.getByText("En curso")).toBeVisible();
    await expect(page.getByText("Finalizado")).toBeVisible();
  });

  test("US1: registro como asistente, sesión iniciada y acceso denegado a organización", async ({ page }) => {
    const email = `e2e-${Date.now()}@test.es`;
    await page.goto("/registro");
    await page.getByLabel("Nombre y apellidos").fill("Prueba E2E");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("secreta123");
    await page.getByLabel("Me registro como").selectOption("ASISTENTE");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByTestId("usuario-actual")).toContainText("Prueba E2E · Asistente");
    await expect(page.getByRole("link", { name: "Área personal" })).toBeVisible();

    await page.goto("/organizador");
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });

  test("US1: correo repetido y credenciales incorrectas muestran el error", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Nombre y apellidos").fill("Repetido");
    await page.getByLabel("Correo electrónico").fill("organizador@congresalia.es");
    await page.getByLabel("Contraseña").fill("secreta123");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Ya existe una cuenta con ese correo");

    await page.goto("/entrar");
    await page.getByLabel("Correo electrónico").fill("organizador@congresalia.es");
    await page.getByLabel("Contraseña").fill("incorrecta");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Correo o contraseña incorrectos");
  });

  test("US1: sin sesión, una zona privada lleva a entrar y vuelve tras iniciar sesión", async ({ page }) => {
    await page.goto("/organizador");
    await expect(page).toHaveURL(/\/entrar\?desde=%2Forganizador/);
    await page.getByLabel("Correo electrónico").fill("organizador@congresalia.es");
    await page.getByLabel("Contraseña").fill("congreso123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/organizador$/);
    await expect(page.getByRole("heading", { name: "Organización" })).toBeVisible();
  });
});
