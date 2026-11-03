import { expect, test, type Page } from "@playwright/test";

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

const SLUG = "jornadas-pediatria-2027";
const ORG = `/organizador/${SLUG}/programa`;
const PUB = `/congresos/${SLUG}/programa`;

async function programar(page: Page, titulo: string, sala: string, inicio: string, fin: string) {
  const p = page.getByTestId("pendiente").filter({ hasText: titulo });
  const select = p.getByLabel("Sala");
  await select.selectOption((await select.locator("option", { hasText: sala }).getAttribute("value"))!);
  await p.getByLabel("Hora de inicio").fill(inicio);
  await p.getByLabel("Hora de fin").fill(fin);
  await p.getByRole("button", { name: "Programar" }).click();
  return p;
}

test.describe.serial("spec-003 · programa (HU-03)", () => {
  test("US3-2: antes de publicar, el visitante ve el aviso y ninguna sesión", async ({ page }) => {
    await page.goto(PUB);
    await expect(page.getByText("El programa aún no se ha publicado.")).toBeVisible();
    await expect(page.getByTestId("sesion-publica")).toHaveCount(0);
  });

  test("US1-1/US1-2/US1-4: programar, solape de ponente rechazado, contigua aceptada", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await page.goto(ORG);
    await programar(page, "Vacunación en la adolescencia", "Auditorio", "10:00", "10:30");
    await expect(page.getByTestId("sesion-org").filter({ hasText: "Vacunación en la adolescencia" })).toContainText("10:00–10:30");

    const alergias = await programar(page, "Alergias alimentarias", "Sala A", "10:15", "10:45");
    await expect(alergias.getByRole("alert")).toHaveText("Pablo Ponente ya tiene la sesión «Vacunación en la adolescencia: retos actuales» de 10:00 a 10:30");

    await alergias.getByLabel("Hora de inicio").fill("10:30");
    await alergias.getByLabel("Hora de fin").fill("11:00");
    await alergias.getByRole("button", { name: "Programar" }).click();
    await expect(page.getByTestId("sesion-org").filter({ hasText: "Alergias alimentarias" })).toContainText("10:30–11:00");
  });

  test("US3-1: publicar y ver el programa público", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await page.goto(ORG);
    await page.getByRole("button", { name: "Publicar programa" }).click();
    await expect(page.getByText("Publicado", { exact: true })).toBeVisible();
    await page.context().clearCookies();
    await page.goto(PUB);
    await expect(page.getByTestId("sesion-publica")).toHaveCount(2);
    await expect(page.getByTestId("sesion-publica").first()).toContainText("10:00–10:30");
    await page.getByRole("link", { name: /Vacunación en la adolescencia/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vacunación en la adolescencia: retos actuales");
    await expect(page.getByText("Ponente: Pablo Ponente")).toBeVisible();
  });

  test("US3-3 / SC-003: el HTML sin JavaScript incluye sesiones, canonical y JSON-LD; sitemap y robots", async ({ request }) => {
    const html = await (await request.get(PUB)).text();
    expect(html).toContain("Vacunación en la adolescencia: retos actuales");
    expect(html).toContain("<title>Programa de Jornadas de Pediatría 2027 · Congresalia</title>");
    expect(html).toMatch(/<link rel="canonical" href="[^"]*\/congresos\/jornadas-pediatria-2027\/programa"/);
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('"@type":"Event"');
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`/congresos/${SLUG}/programa</loc>`);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /organizador");
    expect(robots).toContain("Sitemap:");
  });

  test("US1-7: un asistente no accede al programa del organizador", async ({ page }) => {
    await entrar(page, "asistente1@congresalia.es");
    await page.goto(ORG);
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });
});
