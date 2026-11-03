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

async function abrirPanel(page: Page) {
  await page.goto("/organizador");
  await page.getByRole("link", { name: /Panel/ }).click();
  await page.getByTestId("congreso-panel").filter({ hasText: "Innovación Educativa" }).click();
  await expect(page.getByRole("heading", { name: "Congreso de Innovación Educativa 2026" })).toBeVisible();
}

const sesion = (page: Page, titulo: string) => page.getByTestId("sesion-panel").filter({ hasText: titulo });

test.describe.serial("spec-008 · panel en tiempo real (HU-08)", () => {
  test("US1-1 / US1-2 / SC-001: cifras, desglose y refresco sin recargar", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await abrirPanel(page);
    await expect(page.getByTestId("confirmadas")).toHaveText("35");
    await expect(page.getByTestId("pendientes")).toHaveText("5");
    await expect(page.getByTestId("fila-desglose")).toHaveCount(6);
    const antes = await page.getByTestId("ingresos").textContent();

    // Un pago aprobado nuevo (otra ventana / otro asistente) aparece en ≤ 6 s sin recargar
    const ins = await db.inscripcion.findFirstOrThrow({
      where: { congreso: { slug: "congreso-innovacion-educativa-2026" }, estado: "PENDIENTE_PAGO" },
    });
    await db.pago.create({ data: { inscripcionId: ins.id, importeCent: 12345, resultado: "APROBADO", referencia: "e2e-panel" } });
    await db.inscripcion.update({ where: { id: ins.id }, data: { estado: "CONFIRMADA" } });
    await expect(page.getByTestId("confirmadas")).toHaveText("36", { timeout: 6_000 });
    await expect(page.getByTestId("ingresos")).not.toHaveText(antes!, { timeout: 6_000 });
    await expect(page.getByTestId("actualizado")).toContainText("Actualizado a las");
  });

  test("US2-1 / US2-3 / US3-1: «Rúbricas…» completa, filtro y sin salas libres", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await abrirPanel(page);
    const rubricas = sesion(page, "Rúbricas compartidas entre departamentos");
    await expect(rubricas).toContainText("Completa");
    await expect(rubricas).toContainText("100 %");
    await page.getByLabel("Solo completas o casi completas").check();
    await expect(rubricas).toBeVisible();
    await expect(sesion(page, "Gamificación con recursos abiertos")).toHaveCount(0);
    await rubricas.getByRole("button", { name: "Cambiar de sala" }).click();
    await expect(page.getByText("No hay salas libres en ese horario con aforo suficiente.")).toBeVisible();
  });

  test("US3-2: «Competencia digital docente» pasa al Auditorio (aforo 200)", async ({ page }) => {
    await entrar(page, "organizador@congresalia.es");
    await abrirPanel(page);
    const fila = sesion(page, "Competencia digital docente");
    await expect(fila.getByTestId("sala")).toContainText("Aula 3");
    await fila.getByRole("button", { name: "Cambiar de sala" }).click();
    const selector = page.getByLabel("Nueva sala");
    await expect(selector.locator("option")).toHaveText(["Elige una sala…", "Auditorio (aforo 200)"]);
    await selector.selectOption({ label: "Auditorio (aforo 200)" });
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(fila.getByTestId("sala")).toContainText("Auditorio (200)");
  });

  test("US1-3: un asistente no puede abrir el panel", async ({ page }) => {
    await entrar(page, "asistente1@congresalia.es");
    await page.goto("/organizador/panel");
    await expect(page.getByRole("heading", { name: "Acceso denegado" })).toBeVisible();
  });
});
