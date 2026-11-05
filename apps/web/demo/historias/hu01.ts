import { db, idCongreso } from "../lib/db";
import type { Historia } from "../lib/tipos";

const RESUMEN =
  "Presentamos los resultados de un programa de cribado auditivo neonatal en tres hospitales de la Comunidad Valenciana, con la metodología empleada, los indicadores de cobertura y las mejoras propuestas para los próximos años.";

/** HU-01 · Enviar propuesta de ponencia (spec-001). */
export const hu01: Historia = {
  id: "hu01",
  hu: "HU-01",
  titulo: "Enviar propuesta de ponencia",
  async guion(e) {
    const p = e.page;
    const ped = await idCongreso("jornadas-pediatria-2027");
    const edu = await idCongreso("congreso-innovacion-educativa-2026");
    const areaEdu = (await db.areaTematica.findFirstOrThrow({ where: { congresoId: edu } })).id;
    const areaPed = (await db.areaTematica.findFirstOrThrow({ where: { congresoId: ped, nombre: "Neonatología" } })).id;
    const valida = (congresoId: string, areaId: string) => ({ congresoId, areaId, titulo: "Propuesta enviada sin la interfaz", resumen: RESUMEN });

    await e.portada("HU-01", "Enviar propuesta de ponencia", "Como <b>ponente</b>, quiero enviar una propuesta con un resumen y su área temática para que el comité científico la valore.", [
      "Solo se aceptan propuestas con el plazo de envío abierto",
      "Título, resumen (100–3000 caracteres) y un área válida del congreso",
      "El ponente consulta sus propuestas y su estado, nunca las de otros",
      "Todas las reglas se comprueban también en el servidor",
    ]);

    // ── US1-1
    await e.entrar("ponente1@congresalia.es");
    await e.escenario("US1-1", "Enviar una propuesta dentro del plazo", "Pablo Ponente envía una propuesta a las Jornadas de Pediatría 2027, con la llamada abierta.");
    await e.clic(p.getByRole("link", { name: "Mis propuestas" }), 1000);
    await e.clic(p.getByRole("link", { name: "Enviar propuesta" }), 1200);
    await e.narrar("El desplegable solo ofrece congresos con la llamada a comunicaciones abierta, con su último día.", 1600);
    await e.elegir(p.getByLabel("Congreso"), { contiene: "Jornadas de Pediatría 2027" });
    await e.resaltar(p.getByText(/Plazo de envío hasta el .* \(incluido\)/), 1800);
    await e.elegir(p.getByLabel("Área temática"), { contiene: "Neonatología" });
    await e.escribir(p.getByLabel("Título"), "Cribado auditivo neonatal: tres años de resultados");
    await e.escribirLargo(p.getByLabel("Resumen"), RESUMEN);
    await e.resaltar(p.getByText(/\/ 3000 caracteres/), 1500);
    await e.clic(p.getByRole("button", { name: "Enviar propuesta" }), 1500);
    await e.resaltar(p.getByText("Propuesta enviada."), 1500);
    await e.resaltar(p.getByTestId("fila-propuesta").first(), 2600);

    // ── US1-7 (clarify-2 P4)
    await e.escenario("US1-7", "La misma propuesta dos veces", "Pablo vuelve a enviar el mismo título (en minúsculas y con espacios): el sistema no guarda una copia que el comité tendría que evaluar dos veces.");
    await e.ir("/ponente/enviar", 800);
    await e.elegir(p.getByLabel("Congreso"), { contiene: "Jornadas de Pediatría 2027" });
    await e.elegir(p.getByLabel("Área temática"), { contiene: "Neonatología" });
    await e.escribir(p.getByLabel("Título"), "  cribado auditivo neonatal: tres años de resultados ");
    await e.rellenar(p.getByLabel("Resumen"), RESUMEN);
    await e.clic(p.getByRole("button", { name: "Enviar propuesta" }), 1200);
    await e.resaltar(p.getByRole("alert").filter({ hasText: "Ya has enviado una propuesta con este título a este congreso" }), 2600);
    await e.ir("/ponente", 900);
    await e.resaltar(p.getByTestId("fila-propuesta").filter({ hasText: "Cribado auditivo neonatal" }), 2000);
    await e.narrar("Sigue habiendo una sola. El mismo título en otro congreso sí se admitiría.", 1800);

    // ── US1-4
    await e.escenario("US1-4", "Formulario con datos no válidos", "Sin área y con un resumen demasiado corto: el formulario señala cada campo y no se envía nada.");
    await e.ir("/ponente/enviar", 800);
    await e.elegir(p.getByLabel("Congreso"), { contiene: "Jornadas de Pediatría 2027" });
    await e.escribir(p.getByLabel("Título"), "Título correcto");
    await e.escribir(p.getByLabel("Resumen"), "Demasiado corto");
    await e.clic(p.getByRole("button", { name: "Enviar propuesta" }), 800);
    await e.resaltar(p.getByText("El resumen debe tener entre 100 y 3000 caracteres"), 2000);
    await e.resaltar(p.locator("[aria-invalid=true]").first(), 2000);

    // ── US1-2
    await e.escenario("US1-2", "Plazo de envío cerrado", "El Congreso de Innovación Educativa (en curso) cerró su plazo: ni aparece en el formulario ni lo acepta el servidor.");
    await e.resaltar(p.getByLabel("Congreso"), 1800);
    await e.narrar("Saltándonos la interfaz, enviamos la propuesta directamente al servidor para ese congreso…", 1200);
    await e.peticion("propuesta.enviar", valida(edu, areaEdu));
    await e.ocultarConsola();

    // ── US1-3
    await e.escenario("US1-3", "Plazo de envío que aún no ha abierto", "Para mostrarlo, adelantamos en la base de datos la apertura del plazo de Pediatría a dentro de 5 días.");
    const original = await db.congreso.findUniqueOrThrow({ where: { id: ped }, select: { envioAbre: true } });
    await db.congreso.update({ where: { id: ped }, data: { envioAbre: new Date(Date.now() + 5 * 86_400_000) } });
    await e.aviso("Dato preparado en BD: el plazo de Pediatría abre dentro de 5 días");
    await e.ir("/ponente/enviar", 2400);
    await e.resaltar(p.getByText("Ahora mismo no hay ningún congreso con la llamada a comunicaciones abierta."), 1800);
    await e.peticion("propuesta.enviar", valida(ped, areaPed));
    await db.congreso.update({ where: { id: ped }, data: { envioAbre: original.envioAbre } });
    await e.ocultarConsola();
    await e.aviso("Restaurado: el plazo de Pediatría vuelve a estar abierto");
    await e.pausa(1800);

    // ── US1-5
    await e.escenario("US1-5", "Área temática de otro congreso", "Petición manipulada: congreso de Pediatría con un área del congreso de Innovación Educativa.");
    await e.peticion("propuesta.enviar", valida(ped, areaEdu));
    await e.ocultarConsola();

    // ── US2-1 / US2-3 / US2-4
    await e.escenario("US2-1", "Mis propuestas y su estado", "Todas las propuestas de Pablo, de la más reciente a la más antigua, cada una con su estado.");
    await e.ir("/ponente", 1000);
    for (const estado of ["Enviada", "En evaluación", "Aceptada"]) await e.resaltar(p.getByTestId("fila-propuesta").filter({ hasText: estado }).first(), 1300);
    await e.escenario("US2-3", "El ponente no ve las evaluaciones", "Ni la pantalla ni la respuesta del servidor incluyen puntuaciones, comentarios ni evaluadores.");
    await e.peticion("propuesta.mias", { congresoId: ped }, "query", 6000);
    await e.ocultarConsola();
    await e.escenario("US2-4", "Una propuesta enviada no se modifica ni se retira", "No hay botones para ello, y el servidor no tiene esa operación.");
    await e.resaltar(p.getByTestId("fila-propuesta").first(), 1600);
    await e.peticion("propuesta.retirar", { propuestaId: "cualquiera" });
    await e.ocultarConsola();

    // ── US2-2
    await e.escenario("US2-2", "Cada ponente ve solo las suyas", "Paula Ponente entra: ve su propuesta «Rechazada» y ninguna de Pablo.");
    await e.entrar("ponente2@congresalia.es");
    await e.ir("/ponente", 1000);
    await e.resaltar(p.getByTestId("fila-propuesta").filter({ hasText: "Rechazada" }), 2200);
    await e.narrar("«Método canguro en prematuros extremos» (de Pablo) no aparece en su lista.", 2600);

    // ── US2-5
    await e.escenario("US2-5", "Ponente sin propuestas", "Una cuenta nueva de ponente ve un mensaje amable y el botón para enviar la primera.");
    await e.salir();
    await e.ir("/registro", 500);
    await e.escribir(p.getByLabel("Nombre y apellidos"), "Nora Nueva");
    await e.escribir(p.getByLabel("Correo electrónico"), `nora.${Date.now() % 100000}@test.es`);
    await e.escribir(p.getByLabel("Contraseña"), "secreta123");
    await e.elegir(p.getByLabel("Me registro como"), "PONENTE");
    await e.clic(p.getByRole("button", { name: "Crear cuenta" }), 600);
    await p.getByTestId("usuario-actual").waitFor();
    await e.ir("/ponente", 800);
    await e.resaltar(p.getByText("Todavía no has enviado ninguna propuesta."), 2200);

    // ── US1-6
    await e.escenario("US1-6", "Sin rol de ponente o sin sesión", "Un visitante es llevado a «Entrar»; una asistente ve «Acceso denegado» y el servidor la rechaza.");
    await e.salir();
    await e.ir("/ponente/enviar", 2200);
    await e.entrar("asistente1@congresalia.es");
    await e.ir("/ponente/enviar", 1800);
    await e.peticion("propuesta.enviar", valida(ped, areaPed));
  },
};
