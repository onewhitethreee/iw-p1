import { expect, test, type Page } from "@playwright/test";

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto("/entrar");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

const INSC = "/congresos/jornadas-pediatria-2027/inscripcion";

test.describe.serial("spec-004 · inscripción y pago (HU-04)", () => {
  test("US1-5: sin sesión se ofrecen los enlaces para entrar o registrarse", async ({ page }) => {
    await page.goto(INSC);
    await expect(page.getByTestId("precios")).toContainText("90,00 €");
    await expect(page.getByRole("link", { name: "Crear cuenta para inscribirme" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ya tengo cuenta" })).toHaveAttribute("href", /desde=%2Fcongresos%2Fjornadas-pediatria-2027%2Finscripcion/);
  });

  test("US1-1 + US2-2 + US2-1: inscribirse (temprana 90 €), pago rechazado y después aprobado con QR", async ({ page }) => {
    await entrar(page, "asistente5@congresalia.es");
    await page.goto(INSC);
    await page.getByLabel("Tipo de asistente").selectOption("ESTUDIANTE");
    await page.getByRole("button", { name: "Inscribirme" }).click();
    await expect(page).toHaveURL(/\/area-personal\/pago\//);
    await expect(page.getByRole("button", { name: "Pagar 90,00 €" })).toBeVisible();

    await page.getByLabel("Número de tarjeta").fill("4000 0000 0000 0002");
    await page.getByRole("button", { name: "Pagar 90,00 €" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("El pago ha sido rechazado. Prueba con otra tarjeta.");
    await page.goto("/area-personal");
    await expect(page.getByTestId("inscripcion").filter({ hasText: "Jornadas de Pediatría" })).toContainText("Pendiente de pago");

    await page.getByRole("link", { name: "Pagar 90,00 €" }).click();
    await page.getByLabel("Número de tarjeta").fill("4111 1111 1111 1111");
    await page.getByRole("button", { name: "Pagar 90,00 €" }).click();
    await expect(page).toHaveURL(/\/area-personal\?pagada=1$/);
    const tarjeta = page.getByTestId("inscripcion").filter({ hasText: "Jornadas de Pediatría" });
    await expect(tarjeta).toContainText("Confirmada");
    await expect(tarjeta.getByRole("img", { name: "Código QR de acreditación" })).toBeVisible();
  });

  test("US1-3: ya inscrito → aviso con enlace al área personal", async ({ page }) => {
    await entrar(page, "asistente5@congresalia.es");
    await page.goto(INSC);
    await expect(page.getByText("Ya tienes una inscripción en este congreso.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Inscribirme" })).toHaveCount(0);
  });

  test("US2-6 (clarify-2 P4, T015): cancelar una pendiente y volver a inscribirse con otro tipo", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/registro");
    await page.getByLabel("Nombre y apellidos").fill("Cancela E2E");
    await page.getByLabel("Correo electrónico").fill(`cancela-${Date.now()}@test.es`);
    await page.getByLabel("Contraseña").fill("secreta123");
    await page.getByLabel("Me registro como").selectOption("ASISTENTE");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByTestId("usuario-actual")).toContainText("Cancela E2E");

    await page.goto(INSC);
    await page.getByLabel("Tipo de asistente").selectOption("ESTUDIANTE");
    await page.getByRole("button", { name: "Inscribirme" }).click();
    await expect(page).toHaveURL(/\/area-personal\/pago\//);

    await page.goto("/area-personal");
    const tarjeta = page.getByTestId("inscripcion").filter({ hasText: "Jornadas de Pediatría" });
    await tarjeta.getByRole("button", { name: "Cancelar inscripción" }).click();
    await expect(tarjeta).toContainText("Si vuelves a inscribirte, se aplicará el precio vigente ese día.");
    await tarjeta.getByRole("button", { name: "Sí, cancelar" }).click();
    await expect(tarjeta).toContainText("Cancelada");
    await expect(tarjeta.getByRole("link", { name: /^Pagar/ })).toHaveCount(0);

    await tarjeta.getByRole("link", { name: "Inscribirme de nuevo" }).click();
    await page.getByLabel("Tipo de asistente").selectOption("PROFESIONAL");
    await page.getByRole("button", { name: "Inscribirme" }).click();
    await expect(page).toHaveURL(/\/area-personal\/pago\//);
    await page.goto("/area-personal");
    await expect(tarjeta).toContainText("Pendiente de pago");
    await expect(tarjeta).toContainText("Profesional");
    await expect(page.getByTestId("inscripcion").filter({ hasText: "Jornadas de Pediatría" })).toHaveCount(1);
  });

  test("US1-6: un ponente sin rol de asistente puede añadírselo", async ({ page }) => {
    await entrar(page, "ponente1@congresalia.es");
    await page.goto(INSC);
    await page.getByRole("button", { name: "Añadirme como asistente" }).click();
    await expect(page.getByLabel("Tipo de asistente")).toBeVisible();
  });
});
