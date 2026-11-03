import { expect, test, type Page } from "@playwright/test";

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

async function abrir(page: Page, congreso: string) {
  await page.goto("/area-personal");
  await page.getByRole("link", { name: /Certificado/ }).click();
  await page.getByTestId("congreso-certificado").filter({ hasText: congreso }).click();
  await expect(page.getByRole("heading", { name: congreso })).toBeVisible();
}

test.describe.serial("spec-007 · certificado de asistencia (HU-07)", () => {
  test("US1-1: asistente1 (4 de 5) ve el 80 % y descarga el PDF", async ({ page }) => {
    await entrar(page, "asistente1@congresalia.es");
    await abrir(page, "Simposio de Salud Digital 2026");
    await expect(page.getByTestId("porcentaje")).toHaveText("80 % (4 de 5 sesiones)");
    await expect(page.getByText("Horas de formación: 4 h 30 min")).toBeVisible();
    const descarga = page.waitForEvent("download");
    await page.getByRole("link", { name: "Descargar certificado" }).click();
    const d = await descarga;
    expect(d.suggestedFilename()).toBe("certificado-simposio-salud-digital-2026.pdf");
  });

  test("US1-2 / US1-3: asistente2 (3 de 5) ve el motivo, sin botón, y la URL directa da 403", async ({ page }) => {
    await entrar(page, "asistente2@congresalia.es");
    await abrir(page, "Simposio de Salud Digital 2026");
    const motivo = "No disponible: has asistido al 60 % de las sesiones de tu agenda (3 de 5); se necesita al menos el 80 %";
    await expect(page.getByTestId("motivo")).toHaveText(motivo);
    await expect(page.getByRole("link", { name: "Descargar certificado" })).toHaveCount(0);
    const id = await page.evaluate(async () => {
      const r = await fetch("/api/trpc/congreso.porSlug?input=" + encodeURIComponent(JSON.stringify({ json: { slug: "simposio-salud-digital-2026" } })));
      return ((await r.json()) as { result: { data: { json: { id: string } } } }).result.data.json.id;
    });
    const res = await page.request.get(`/api/certificado/${id}`);
    expect(res.status()).toBe(403);
    expect(await res.text()).toBe(motivo);
  });

  test("US1-5: asistente3 con la agenda vacía", async ({ page }) => {
    await entrar(page, "asistente3@congresalia.es");
    await abrir(page, "Simposio de Salud Digital 2026");
    await expect(page.getByTestId("motivo")).toHaveText("No disponible: tu agenda no tiene sesiones");
  });

  test("US1-4: congreso en curso → disponible cuando termine, con porcentaje provisional", async ({ page }) => {
    await entrar(page, "asistente1@congresalia.es");
    await abrir(page, "Congreso de Innovación Educativa 2026");
    await expect(page.getByTestId("motivo")).toContainText("Disponible cuando termine el congreso (");
    await expect(page.getByText("Asistencia provisional")).toBeVisible();
  });
});
