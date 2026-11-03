import { PrismaClient } from "@prisma/client";
import { expect, test, type Page } from "@playwright/test";

const db = new PrismaClient();
test.afterAll(() => db.$disconnect());

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

/** Código de acreditación del asistente en el congreso en curso (lo que lleva impreso bajo su QR). */
async function codigoDe(email: string) {
  const ins = await db.inscripcion.findFirstOrThrow({
    where: { usuario: { email }, congreso: { slug: "congreso-innovacion-educativa-2026" } },
  });
  return ins.codigoAcreditacion!;
}

async function abrirPuerta(page: Page, titulo: string) {
  await page.goto("/acreditacion");
  await page.getByTestId("congreso-acreditacion").filter({ hasText: "Innovación Educativa" }).click();
  const fila = page.getByTestId("sesion-acreditacion").filter({ hasText: titulo });
  await expect(fila).toContainText("Abierta ahora");
  await fila.getByRole("link", { name: titulo }).click();
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();
}

async function validar(page: Page, codigo: string) {
  await page.getByLabel("Código de acreditación").fill(codigo);
  await page.getByRole("button", { name: "Validar" }).click();
}

test.describe.serial("spec-006 · control de acceso con QR (HU-06)", () => {
  test("US1-1 / US1-5 / US2-1: admitido, contador +1 y después «Ya registrado»", async ({ page }) => {
    const codigo = await codigoDe("asistente3@congresalia.es");
    await entrar(page, "acreditacion@congresalia.es");
    await abrirPuerta(page, "Aprendizaje basado en proyectos en secundaria");
    await expect(page.getByTestId("ocupacion")).toHaveText("1 / 200");

    await validar(page, codigo);
    await expect(page.getByTestId("resultado")).toContainText("Admitido");
    await expect(page.getByTestId("resultado")).toContainText("Asistente 3");
    await expect(page.getByTestId("ocupacion")).toHaveText("2 / 200");

    await validar(page, `  ${codigo}  `);
    await expect(page.getByTestId("resultado")).toContainText("Ya registrado");
    await expect(page.getByTestId("ocupacion")).toHaveText("2 / 200");
  });

  test("US1-2: «Rúbricas compartidas…» está llena → «Aforo completo»", async ({ page }) => {
    const codigo = await codigoDe("asistente3@congresalia.es");
    await entrar(page, "acreditacion@congresalia.es");
    await abrirPuerta(page, "Rúbricas compartidas entre departamentos");
    await expect(page.getByTestId("ocupacion")).toHaveText("2 / 2");
    await validar(page, codigo);
    await expect(page.getByTestId("resultado")).toContainText("Rechazado");
    await expect(page.getByTestId("resultado")).toContainText("Aforo completo");
    await expect(page.getByTestId("ocupacion")).toHaveText("2 / 2");
  });

  test("US1-3: un código inventado → «Acreditación no válida»", async ({ page }) => {
    await entrar(page, "acreditacion@congresalia.es");
    await abrirPuerta(page, "Aprendizaje basado en proyectos en secundaria");
    await validar(page, "codigo-inventado-123");
    await expect(page.getByTestId("resultado")).toContainText("Acreditación no válida");
  });

  test("US1-6: un asistente no puede entrar en la zona de acreditación", async ({ page }) => {
    await entrar(page, "asistente1@congresalia.es");
    await page.goto("/acreditacion");
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });
});
