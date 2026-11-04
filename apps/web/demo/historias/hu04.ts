import { db, idCongreso } from "../lib/db";
import { CLAVE } from "../lib/escena";
import type { Historia } from "../lib/tipos";

const PED = "/congresos/jornadas-pediatria-2027/inscripcion";
const EDU = "/congresos/congreso-innovacion-educativa-2026/inscripcion";

/** HU-04 · Inscribirse y pagar la entrada (spec-004). */
export const hu04: Historia = {
  id: "hu04",
  hu: "HU-04",
  titulo: "Inscribirse y pagar la entrada",
  async guion(e) {
    const p = e.page;
    const tarjeta = (texto: string) => p.getByTestId("inscripcion").filter({ hasText: texto });
    const ped = await idCongreso("jornadas-pediatria-2027");
    const edu = await idCongreso("congreso-innovacion-educativa-2026");
    const sal = await idCongreso("simposio-salud-digital-2026");
    const deAsistente4 = await db.inscripcion.findFirstOrThrow({ where: { usuario: { email: "asistente4@congresalia.es" }, congresoId: edu } });

    await e.portada("HU-04", "Inscribirse y pagar la entrada", "Como <b>asistente</b>, quiero inscribirme eligiendo mi tipo de entrada y pagarla para asistir al congreso.", [
      "Tarifa según tipo (profesional, socio, estudiante) y fecha: temprana o general",
      "La inscripción queda pendiente hasta que se paga (pago simulado)",
      "Confirmada, el asistente obtiene su acreditación con código QR",
      "El importe lo calcula siempre el servidor",
    ]);

    // ── US1-5
    await e.escenario("US1-5", "Inscribirse sin haber iniciado sesión", "Un visitante ve los precios y se le ofrece crear una cuenta o entrar; después vuelve a la inscripción.");
    await e.ir(PED, 1200);
    await e.resaltar(p.getByTestId("precios"), 2400);
    await e.resaltar(p.getByText(/Precio reducido hasta el/), 1800);
    await e.resaltar(p.getByRole("link", { name: "Crear cuenta para inscribirme" }), 1000);
    await e.clic(p.getByRole("link", { name: "Ya tengo cuenta" }), 1200);
    await e.escribir(p.getByLabel("Correo electrónico"), "asistente5@congresalia.es", 150);
    await e.escribir(p.getByLabel("Contraseña"), CLAVE, 200);
    await e.clic(p.getByRole("button", { name: "Entrar" }), 1500);
    await p.getByLabel("Tipo de asistente").waitFor();
    await e.narrar("Tras entrar, Asistente 5 vuelve directamente al formulario de inscripción.", 2000);

    // ── US1-1
    await e.escenario("US1-1", "Inscripción con tarifa temprana", "Elige «Estudiante»: precio temprano de 90 €. La inscripción se crea pendiente de pago.");
    await e.elegir(p.getByLabel("Tipo de asistente"), "ESTUDIANTE", 1200);
    await e.clic(p.getByRole("button", { name: "Inscribirme" }), 1500);
    await p.getByRole("button", { name: "Pagar 90,00 €" }).waitFor();
    await e.resaltar(p.getByRole("button", { name: "Pagar 90,00 €" }), 1800);

    // ── US2-5
    await e.escenario("US2-5", "Inscripción pendiente en el área personal", "Se ve «Pendiente de pago», el importe y el botón «Pagar»… pero todavía no hay QR.");
    await e.clic(p.getByRole("link", { name: "Área personal" }), 1200);
    await e.resaltar(tarjeta("Jornadas de Pediatría"), 3000);

    // ── US2-2
    await e.escenario("US2-2", "Pago rechazado", "Con la tarjeta de prueba 4000 0000 0000 0002 el pago se rechaza; la inscripción sigue pendiente y se puede reintentar.");
    await e.clic(tarjeta("Jornadas de Pediatría").getByRole("link", { name: "Pagar 90,00 €" }), 1200);
    await e.escribir(p.getByLabel("Número de tarjeta"), "4000 0000 0000 0002");
    await e.clic(p.getByRole("button", { name: "Pagar 90,00 €" }), 1200);
    await e.resaltar(p.getByRole("main").getByRole("alert"), 2600);

    // ── US2-1
    await e.escenario("US2-1", "Pago aprobado y acreditación con QR", "Reintenta con otra tarjeta: la inscripción pasa a «Confirmada» y aparece su código QR.");
    await e.escribir(p.getByLabel("Número de tarjeta"), "4111 1111 1111 1111");
    await e.clic(p.getByRole("button", { name: "Pagar 90,00 €" }), 1500);
    await p.waitForURL(/pagada=1/);
    await e.resaltar(p.getByText("Pago aprobado. Tu inscripción está confirmada."), 1600);
    await e.resaltar(tarjeta("Jornadas de Pediatría"), 2000);
    await e.resaltar(tarjeta("Jornadas de Pediatría").getByRole("img", { name: "Código QR de acreditación" }), 2600);

    // ── US2-3
    await e.escenario("US2-3", "Sin pagos dobles", "Intentar pagar otra vez la inscripción ya confirmada.");
    const mia = await db.inscripcion.findFirstOrThrow({ where: { usuario: { email: "asistente5@congresalia.es" }, congresoId: ped } });
    await e.peticion("inscripcion.pagar", { inscripcionId: mia.id, tarjeta: "4111 1111 1111 1111" });
    await e.ocultarConsola();

    // ── US1-3
    await e.escenario("US1-3", "Ya inscrito en ese congreso", "Al volver a la página de inscripción se le lleva a su inscripción existente; el servidor tampoco admite una segunda.");
    await e.ir(PED, 1200);
    await e.resaltar(p.getByText("Ya tienes una inscripción en este congreso."), 2000);
    await e.peticion("inscripcion.crear", { congresoId: ped, tipoAsistente: "PROFESIONAL" });
    await e.ocultarConsola();

    // ── US1-2
    await e.escenario("US1-2", "Pasado el día límite: precio general", "En el Congreso de Innovación Educativa la inscripción temprana ya terminó: 300 / 220 / 120 €.");
    await e.ir(EDU, 1200);
    await e.resaltar(p.getByText("Precio general (el plazo de inscripción temprana ha terminado)."), 1800);
    await e.resaltar(p.getByTestId("precios"), 2200);

    // ── US1-7 (+ US1-4: congreso en curso)
    await e.escenario("US1-7", "Importe manipulado en la petición", "Se envía la inscripción con un importe de 1 € inventado: el servidor lo ignora y aplica la tarifa vigente (el congreso está en curso y se admite).");
    await e.peticion("inscripcion.crear", { congresoId: edu, tipoAsistente: "PROFESIONAL", importeCent: 100 }, "mutation", 6500);
    await e.ocultarConsola();
    await e.ir("/area-personal", 1200);
    await e.resaltar(tarjeta("Innovación Educativa"), 2400);

    // ── US2-4
    await e.escenario("US2-4", "Pagar la inscripción de otra persona", "Asistente 5 intenta pagar la inscripción pendiente de Asistente 4.");
    await e.peticion("inscripcion.pagar", { inscripcionId: deAsistente4.id, tarjeta: "4111 1111 1111 1111" });
    await e.ocultarConsola();

    // ── US1-4
    await e.escenario("US1-4", "Congreso finalizado", "El Simposio de Salud Digital ya terminó: no admite inscripciones.");
    await e.ir("/congresos/simposio-salud-digital-2026/inscripcion", 1200);
    await e.resaltar(p.getByText("El congreso ha finalizado: ya no se admiten inscripciones."), 2000);
    await e.peticion("inscripcion.crear", { congresoId: sal, tipoAsistente: "SOCIO" });
    await e.ocultarConsola();

    // ── US1-6
    await e.entrar("ponente1@congresalia.es");
    await e.escenario("US1-6", "Un ponente que quiere inscribirse", "Pablo solo tiene el rol de ponente: sin el rol de asistente el servidor rechaza la inscripción…");
    await e.ir(PED, 1200);
    await e.resaltar(p.getByText("Tu cuenta no tiene el rol de asistente."), 1500);
    await e.peticion("inscripcion.crear", { congresoId: ped, tipoAsistente: "PROFESIONAL" });
    await e.ocultarConsola();
    await e.narrar("…pero puede añadirse el rol con un clic y continuar con su inscripción.", 1200);
    await e.clic(p.getByRole("button", { name: "Añadirme como asistente" }), 1500);
    await e.resaltar(p.getByTestId("usuario-actual"), 1500);
    await e.elegir(p.getByLabel("Tipo de asistente"), "PROFESIONAL", 1000);
    await e.clic(p.getByRole("button", { name: "Inscribirme" }), 1500);
    await e.resaltar(p.getByRole("button", { name: "Pagar 250,00 €" }), 2200);
  },
};
