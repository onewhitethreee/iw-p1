import type { Historia } from "../lib/tipos";

/** Introducción: portada pública, fases de los congresos, registro, inicio de sesión y roles (spec 000-core). */
export const hu00: Historia = {
  id: "hu00",
  hu: "BASE",
  titulo: "Base común: portada, cuentas y roles",
  async guion(e) {
    const p = e.page;
    await e.portada("BASE COMÚN · 000-core", "Congresalia: portada, cuentas y roles", "Antes de las historias: qué ve un visitante, cómo se crea una cuenta y cómo cada rol tiene su zona.", [
      "Portada pública con los tres congresos del seed y su fase",
      "Registro e inicio de sesión, con sus errores",
      "Zonas protegidas por rol y doble rol en una misma cuenta",
      "Páginas inexistentes",
    ]);

    await e.ir("/", 800);
    await e.escenario("US2-1", "Portada pública sin iniciar sesión", "Tres congresos de ejemplo, cada uno en una fase distinta del ciclo de vida.");
    await e.resaltar(p.getByText("Llamada a comunicaciones abierta").first(), 1800);
    await e.resaltar(p.getByText("En curso").first(), 1800);
    await e.resaltar(p.getByText("Finalizado").first(), 1800);

    await e.escenario("US2-3", "Ficha de un congreso", "Fase, fechas y plazo de envío expresado como días completos (ambos incluidos).");
    await e.clic(p.getByTestId("tarjeta-congreso").filter({ hasText: "Pediatría" }), 1200);
    await e.resaltar(p.getByTestId("plazo-envio"), 3200);

    await e.escenario("US2-2", "Un congreso que no existe", "La URL inventada devuelve un 404 con la página «Página no encontrada».");
    await e.ir("/congresos/no-existe", 2800);

    await e.escenario("US1-1", "Registro como asistente", "Se crea la cuenta y la sesión queda iniciada con el rol elegido.");
    await e.ir("/registro", 600);
    await e.escribir(p.getByLabel("Nombre y apellidos"), "Lucía Demo");
    await e.escribir(p.getByLabel("Correo electrónico"), `lucia.demo.${Date.now() % 100000}@test.es`);
    await e.escribir(p.getByLabel("Contraseña"), "secreta123");
    await e.elegir(p.getByLabel("Me registro como"), "ASISTENTE");
    await e.clic(p.getByRole("button", { name: "Crear cuenta" }), 600);
    await p.getByTestId("usuario-actual").waitFor();
    await e.resaltar(p.getByTestId("usuario-actual"), 2400);

    await e.escenario("US1-5", "Una misma cuenta con dos roles", "La asistente se añade el rol de ponente sin crear otra cuenta: aparece la zona «Mis propuestas».");
    await e.clic(p.getByRole("button", { name: "Quiero ser también ponente" }), 1500);
    await e.resaltar(p.getByTestId("usuario-actual"), 1800);
    await e.resaltar(p.getByRole("link", { name: "Mis propuestas" }), 2000);

    await e.escenario("US1-2", "Zona de otro rol: acceso denegado", "Con su sesión, la asistente intenta abrir la zona de organización.");
    await e.ir("/organizador", 3000);

    await e.escenario("US1-3", "Errores de registro e inicio de sesión", "Correo ya registrado y contraseña incorrecta: mensajes claros, sin revelar más.");
    await e.salir();
    await e.ir("/registro", 500);
    await e.escribir(p.getByLabel("Nombre y apellidos"), "Repetido");
    await e.escribir(p.getByLabel("Correo electrónico"), "organizador@congresalia.es");
    await e.escribir(p.getByLabel("Contraseña"), "secreta123");
    await e.clic(p.getByRole("button", { name: "Crear cuenta" }), 800);
    await e.resaltar(p.getByRole("main").getByRole("alert"), 2400);
    await e.ir("/entrar", 500);
    await e.escribir(p.getByLabel("Correo electrónico"), "organizador@congresalia.es");
    await e.escribir(p.getByLabel("Contraseña"), "incorrecta");
    await e.clic(p.getByRole("button", { name: "Entrar" }), 800);
    await e.resaltar(p.getByRole("main").getByRole("alert"), 2400);

    await e.escenario("US1-4", "Zona privada sin sesión", "Un visitante abre /organizador: se le pide entrar y, tras hacerlo, vuelve a donde iba.");
    await e.ir("/organizador", 1800);
    await e.escribir(p.getByLabel("Correo electrónico"), "organizador@congresalia.es");
    await e.escribir(p.getByLabel("Contraseña"), "congreso123");
    await e.clic(p.getByRole("button", { name: "Entrar" }), 1200);
    await p.getByRole("heading", { name: "Organización" }).waitFor();
    await e.narrar("De vuelta en /organizador con la sesión de Olga Organizadora.", 2600);
  },
};
