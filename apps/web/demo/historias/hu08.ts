import { codigoDe, db, idCongreso, idSesion } from "../lib/db";
import type { Escena } from "../lib/escena";
import type { Historia } from "../lib/tipos";
import { entrarEn, trpcEn } from "../lib/ventana";

const EDU = "congreso-innovacion-educativa-2026";

async function abrirPanel(e: Escena, congreso: string) {
  const p = e.page;
  await e.ir("/organizador", 700);
  await e.clic(p.getByRole("link", { name: /Panel/ }), 1000);
  await e.clic(p.getByTestId("congreso-panel").filter({ hasText: congreso }), 1500);
  await p.getByTestId("confirmadas").waitFor();
}

/** HU-08 · Consultar el panel del congreso en tiempo real (spec-008). */
export const hu08: Historia = {
  id: "hu08",
  hu: "HU-08",
  titulo: "Panel del congreso en tiempo real",
  async guion(e, h) {
    const p = e.page;
    const sesion = (t: string) => p.getByTestId("sesion-panel").filter({ hasText: t });

    await e.portada("HU-08", "Panel del congreso en tiempo real", "Como <b>organizador</b>, quiero un panel con inscripciones, ingresos y ocupación de cada sesión, con desglose por tipo de entrada, para tomar decisiones sobre la marcha.", [
      "Inscripciones e ingresos, totales y por tipo de entrada y tarifa",
      "Ocupación de cada sesión respecto a su aforo",
      "Se actualiza solo, sin recargar la página",
      "Detectar sesiones llenas y moverlas a una sala más grande",
    ]);

    // ── US1-1
    await e.entrar("organizador@congresalia.es");
    await e.escenario("US1-1", "Inscripciones e ingresos con desglose", "Panel del Congreso de Innovación Educativa: confirmadas, pendientes, ingresos y tabla por tipo y tarifa.");
    await abrirPanel(e, "Innovación Educativa");
    for (const id of ["confirmadas", "pendientes", "ingresos"]) await e.resaltar(p.getByTestId(id), 1300);
    await e.desplazar(320, 600);
    for (const f of await p.getByTestId("fila-desglose").all()) await e.resaltar(f, 650);
    await e.arriba();

    // ── US1-2
    await e.escenario("US1-2", "Un pago nuevo aparece sin recargar", "En otra ventana, Asistente 4 paga su inscripción pendiente. El panel se actualiza solo en pocos segundos.");
    await e.resaltar(p.getByTestId("actualizado"), 1200);
    const asis = await h.nuevaVentana();
    await entrarEn(asis, "asistente4@congresalia.es");
    await asis.goto("/area-personal");
    await asis.getByTestId("inscripcion").filter({ hasText: "Innovación Educativa" }).getByRole("link", { name: /^Pagar/ }).click();
    await asis.getByLabel("Número de tarjeta").fill("4111 1111 1111 1111");
    await asis.getByRole("button", { name: /^Pagar/ }).click();
    await asis.waitForURL(/pagada=1/);
    await e.pip("Ventana de Asistente 4: pago aprobado", asis, 500);
    await p.getByTestId("confirmadas").filter({ hasText: /^36$/ }).waitFor({ timeout: 8000 });
    await e.resaltar(p.getByTestId("confirmadas"), 1500);
    await e.resaltar(p.getByTestId("pendientes"), 1200);
    await e.resaltar(p.getByTestId("ingresos"), 1200);
    await e.resaltar(p.getByTestId("actualizado"), 1600);
    await e.ocultarConsola();

    // ── US2-1
    await e.escenario("US2-1", "Ocupación de cada sesión", "Reservas y asistencias frente al aforo; «Rúbricas…» está «Completa» (100 %).");
    await sesion("Aprendizaje basado en proyectos").scrollIntoViewIfNeeded();
    await e.resaltar(sesion("Aprendizaje basado en proyectos"), 1500);
    await e.resaltar(sesion("Rúbricas compartidas"), 2200);

    // ── US2-2
    await e.escenario("US2-2", "Una entrada en la puerta se refleja al momento", "El personal de acreditación admite a Asistente 3 en «Aprendizaje basado en proyectos…»: sus asistencias suben sin recargar.");
    const antes = (await sesion("Aprendizaje basado en proyectos").getByTestId("asistencias").innerText()).trim();
    const puerta = await h.nuevaVentana();
    await entrarEn(puerta, "acreditacion@congresalia.es");
    await puerta.goto(`/acreditacion/${EDU}/${await idSesion("Aprendizaje basado en proyectos en secundaria")}`);
    await puerta.getByLabel("Código de acreditación").fill(await codigoDe("asistente3@congresalia.es", EDU));
    await puerta.getByRole("button", { name: "Validar" }).click();
    await puerta.getByTestId("resultado").waitFor();
    await e.pip("Puerta del Auditorio: Asistente 3 admitida", puerta, 500);
    await sesion("Aprendizaje basado en proyectos").getByTestId("asistencias").filter({ hasNotText: antes }).waitFor({ timeout: 8000 });
    await e.resaltar(sesion("Aprendizaje basado en proyectos"), 2600);
    await e.ocultarConsola();

    // ── US2-3
    await e.escenario("US2-3", "Solo las sesiones llenas", "El filtro deja solo las sesiones completas o casi completas (≥ 90 %).");
    await e.clic(p.getByLabel("Solo completas o casi completas"), 1500);
    await e.resaltar(sesion("Rúbricas compartidas"), 1800);

    // ── US3-1 (sin salas)
    await e.escenario("US3-1", "Buscar una sala más grande", "Para «Rúbricas…» solo se ofrecen salas libres en su horario con aforo suficiente… y ahora mismo no hay ninguna.");
    await e.clic(sesion("Rúbricas compartidas").getByRole("button", { name: "Cambiar de sala" }), 1300);
    await e.resaltar(p.getByText("No hay salas libres en ese horario con aforo suficiente."), 2400);
    await e.clic(p.getByLabel("Solo completas o casi completas"), 1000);

    // ── US3-3
    await e.escenario("US3-3", "Otra persona ocupa la sala mientras decido", "«Competencia digital docente» está en el Aula 3 (aforo 2), que se queda pequeña. Se ofrece el Auditorio… pero otro organizador lo ocupa justo antes de confirmar.");
    const comp = sesion("Competencia digital docente");
    await comp.scrollIntoViewIfNeeded();
    await e.resaltar(comp, 1500);
    await e.clic(comp.getByRole("button", { name: "Cambiar de sala" }), 1300);
    await e.elegir(p.getByLabel("Nueva sala"), { label: "Auditorio (aforo 200)" }, 900);
    const otroOrg = await h.nuevaVentana();
    await entrarEn(otroOrg, "organizador@congresalia.es");
    const auditorio = await db.sala.findFirstOrThrow({ where: { nombre: "Auditorio", congreso: { slug: EDU } } });
    const r = await trpcEn(otroOrg, "panel.cambiarSala", { sesionId: await idSesion("Coevaluación entre iguales"), salaId: auditorio.id });
    console.log(`   [US3-3] otro organizador mueve Coevaluación al Auditorio → ${r.status} ${r.mensaje}`);
    await e.aviso("Mientras tanto, en otra ventana: «Coevaluación entre iguales» pasa al Auditorio a la misma hora");
    await e.pausa(2500);
    await e.clic(p.getByRole("button", { name: "Confirmar" }), 1200);
    await e.resaltar(p.getByRole("alert").first(), 2800);
    await e.resaltar(comp.getByTestId("sala"), 1500);
    await e.aviso(null);

    // ── US3-2
    await e.escenario("US3-2", "Cambiar a una sala más grande", "Al volver a buscar, la Sala Magna (aforo 60) ha quedado libre: la sesión pasa allí.");
    await p.reload();
    await p.getByTestId("confirmadas").waitFor();
    await comp.scrollIntoViewIfNeeded();
    await e.clic(comp.getByRole("button", { name: "Cambiar de sala" }), 1300);
    await e.elegir(p.getByLabel("Nueva sala"), { contiene: "Sala Magna" }, 900);
    await e.clic(p.getByRole("button", { name: "Confirmar" }), 1500);
    await e.resaltar(comp, 2200);
    await e.narrar("El programa público ya lo muestra en la Sala Magna:", 800);
    await e.ir(`/congresos/${EDU}/programa`, 900);
    await e.resaltar(p.getByTestId("sesion-publica").filter({ hasText: "Competencia digital docente" }), 2600);

    // ── US3-4
    await e.escenario("US3-4", "Sesiones terminadas y congresos finalizados", "«Conferencia inaugural…» ya terminó: no ofrece «Cambiar de sala» y el servidor lo rechaza. Igual en el Simposio, ya finalizado.");
    await abrirPanel(e, "Innovación Educativa");
    await sesion("Conferencia inaugural").scrollIntoViewIfNeeded();
    await e.resaltar(sesion("Conferencia inaugural"), 1800);
    const magna = await db.sala.findFirstOrThrow({ where: { nombre: "Sala Magna", congreso: { slug: EDU } } });
    await e.peticion("panel.cambiarSala", { sesionId: await idSesion("Conferencia inaugural: la escuela que viene"), salaId: magna.id });
    await e.ocultarConsola();
    await abrirPanel(e, "Simposio de Salud Digital");
    const triana = await db.sala.findFirstOrThrow({ where: { nombre: "Sala Triana", congreso: { slug: "simposio-salud-digital-2026" } } });
    await e.peticion("panel.cambiarSala", { sesionId: await idSesion("Teleconsulta en atención primaria"), salaId: triana.id });
    await e.ocultarConsola();

    // ── US1-4
    await e.escenario("US1-4", "Congreso sin inscripciones", "Las Jornadas de Pediatría 2027 aún no tienen inscripciones: el panel muestra ceros, sin errores.");
    await abrirPanel(e, "Pediatría");
    for (const id of ["confirmadas", "pendientes", "ingresos"]) await e.resaltar(p.getByTestId(id), 1000);

    // ── Sin conexión
    await e.escenario("Sin red", "Se cae la conexión", "El panel conserva las últimas cifras y avisa de que no están actualizadas; al volver la red se recupera.");
    await abrirPanel(e, "Innovación Educativa");
    await p.route("**/api/trpc/**", (r) => r.abort("internetdisconnected"));
    await e.aviso("Red desconectada");
    await p.getByText(/Sin actualizar desde/).waitFor({ timeout: 10_000 });
    await e.resaltar(p.getByTestId("actualizado"), 2000);
    await e.resaltar(p.getByTestId("confirmadas"), 1200);
    await p.unroute("**/api/trpc/**");
    await e.aviso("Red recuperada");
    await p.getByText(/Actualizado a las/).waitFor({ timeout: 10_000 });
    await e.resaltar(p.getByTestId("actualizado"), 1800);
    await e.aviso(null);

    // ── US1-3
    await e.entrar("asistente1@congresalia.es");
    await e.escenario("US1-3", "Solo para la organización", "Una asistente no puede abrir el panel ni pedir sus datos directamente.");
    await e.ir("/organizador/panel", 1800);
    await e.peticion("panel.resumen", { congresoId: await idCongreso(EDU) }, "query");
  },
};
