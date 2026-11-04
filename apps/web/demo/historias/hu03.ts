import type { Locator } from "@playwright/test";
import { db, idPropuesta, idSesion } from "../lib/db";
import type { Escena } from "../lib/escena";
import type { Historia } from "../lib/tipos";

const PED = "jornadas-pediatria-2027";
const ORG = `/organizador/${PED}/programa`;
const PUB = `/congresos/${PED}/programa`;
const diaISO = (d: Date, zona = "Europe/Madrid") => new Intl.DateTimeFormat("sv-SE", { timeZone: zona }).format(d);

async function programar(e: Escena, titulo: string, sala: string, inicio: string, fin: string) {
  const fila = e.page.getByTestId("pendiente").filter({ hasText: titulo });
  await e.resaltar(fila, 900);
  await e.elegir(fila.getByLabel("Sala"), { contiene: sala }, 400);
  await e.rellenar(fila.getByLabel("Hora de inicio"), inicio, 200);
  await e.rellenar(fila.getByLabel("Hora de fin"), fin, 300);
  await e.clic(fila.getByRole("button", { name: "Programar" }), 1300);
  return fila;
}

async function horario(e: Escena, zona: Locator, inicio: string, fin: string) {
  await e.rellenar(zona.getByLabel("Hora de inicio"), inicio, 200);
  await e.rellenar(zona.getByLabel("Hora de fin"), fin, 300);
}

/** HU-03 · Montar y publicar el programa (spec-003). */
export const hu03: Historia = {
  id: "hu03",
  hu: "HU-03",
  titulo: "Montar y publicar el programa",
  async guion(e) {
    const p = e.page;
    const sesion = (titulo: string) => p.getByTestId("sesion-org").filter({ hasText: titulo });
    const ped = await db.congreso.findUniqueOrThrow({ where: { slug: PED }, include: { salas: true } });
    const primerDia = diaISO(ped.inicio);
    const fueraDeFechas = diaISO(new Date(ped.fin.getTime() + 3 * 86_400_000));
    const salaA = ped.salas.find((s) => s.nombre === "Sala A")!.id;

    await e.portada("HU-03", "Montar y publicar el programa", "Como <b>organizador</b>, quiero asignar cada ponencia aceptada a una sala y un horario y publicar el programa para que asistentes y público lo consulten.", [
      "Solo se programan ponencias aceptadas, dentro de las fechas del congreso",
      "Sin solapes de ponente ni de sala (los intervalos contiguos sí valen)",
      "Mover o quitar sesiones respetando reservas, aforo y sesiones empezadas",
      "Programa público renderizado en servidor, con SEO y datos estructurados",
    ]);

    // ── US3-2
    await e.escenario("US3-2", "Programa aún sin publicar", "Un visitante abre el programa de las Jornadas de Pediatría 2027 antes de que se publique.");
    await e.ir(PUB, 1200);
    await e.resaltar(p.getByText("El programa aún no se ha publicado."), 2200);

    // ── US1-1
    await e.entrar("organizador@congresalia.es");
    await e.escenario("US1-1", "Programar una ponencia aceptada", "«Vacunación en la adolescencia» en el Auditorio de 10:00 a 10:30: sale de «pendientes» y pasa al programa.");
    await e.ir(ORG, 1500);
    await programar(e, "Vacunación en la adolescencia", "Auditorio", "10:00", "10:30");
    await e.resaltar(sesion("Vacunación en la adolescencia"), 2200);

    // ── US1-2
    await e.escenario("US1-2", "Solape de ponente", "«Alergias alimentarias» es también de Pablo Ponente: de 10:15 a 10:45 choca con su otra sesión.");
    const alergias = await programar(e, "Alergias alimentarias", "Sala A", "10:15", "10:45");
    await e.resaltar(alergias.getByRole("alert"), 2800);

    // ── US1-4
    await e.escenario("US1-4", "Intervalos contiguos", "De 10:30 a 11:00 empieza justo cuando acaba la otra: no se solapan y se acepta.");
    await horario(e, alergias, "10:30", "11:00");
    await e.clic(alergias.getByRole("button", { name: "Programar" }), 1300);
    await e.resaltar(sesion("Alergias alimentarias"), 2200);

    // ── US1-3
    await e.escenario("US1-3", "Solape de sala", "«Lactancia materna…» en el Auditorio de 10:00 a 10:30: la sala ya está ocupada.");
    const lactancia = await programar(e, "Lactancia materna", "Auditorio", "10:00", "10:30");
    await e.resaltar(lactancia.getByRole("alert"), 2800);
    await e.elegir(lactancia.getByLabel("Sala"), { contiene: "Sala B" });
    await e.clic(lactancia.getByRole("button", { name: "Programar" }), 1300);
    await e.narrar("En la Sala B no hay conflicto: queda programada.", 1600);

    // ── US1-6
    await e.escenario("US1-6", "Horario no válido", "Primero, una hora de fin anterior a la de inicio; después, un día fuera de las fechas del congreso.");
    const salud = p.getByTestId("pendiente").filter({ hasText: "Salud mental" });
    await programar(e, "Salud mental", "Sala A", "12:00", "11:00");
    await e.resaltar(salud.getByRole("alert"), 2200);
    await e.rellenar(salud.getByLabel("Día"), fueraDeFechas, 900);
    await horario(e, salud, "12:00", "13:00");
    await e.clic(salud.getByRole("button", { name: "Programar" }), 1200);
    await e.resaltar(salud.getByRole("alert"), 2200);
    await e.rellenar(salud.getByLabel("Día"), primerDia, 500);
    await e.clic(salud.getByRole("button", { name: "Programar" }), 1300);
    await e.narrar("Con el día correcto se programa de 12:00 a 13:00 en la Sala A.", 1600);

    // ── US1-5
    await e.escenario("US1-5", "Programar una propuesta no aceptada", "«Bronquiolitis…» sigue «Enviada»: ni aparece en pendientes ni la acepta el servidor.");
    await e.peticion("programa.programar", { propuestaId: await idPropuesta("Bronquiolitis: actualización del protocolo de urgencias"), salaId: salaA, dia: primerDia, horaInicio: "16:00", horaFin: "16:30" });
    await e.ocultarConsola();

    // ── US2-1
    await e.escenario("US2-1", "Mover una sesión sin conflictos", "«Lactancia materna…» pasa de la Sala B (10:00) a la Sala A de 11:00 a 11:30.");
    const filaLact = sesion("Lactancia materna");
    await e.clic(filaLact.getByRole("button", { name: "Cambiar" }), 800);
    await e.elegir(filaLact.getByLabel("Sala"), { contiene: "Sala A" });
    await horario(e, filaLact, "11:00", "11:30");
    await e.clic(filaLact.getByRole("button", { name: "Guardar" }), 1400);
    await e.resaltar(sesion("Lactancia materna"), 2200);

    // ── US2-2
    await e.escenario("US2-2", "Mover provocando un solape", "La llevamos al Auditorio de 10:15 a 10:45: choca con «Vacunación…» y la sesión no cambia.");
    await e.clic(sesion("Lactancia materna").getByRole("button", { name: "Cambiar" }), 800);
    await e.elegir(sesion("Lactancia materna").getByLabel("Sala"), { contiene: "Auditorio" });
    await horario(e, sesion("Lactancia materna"), "10:15", "10:45");
    await e.clic(sesion("Lactancia materna").getByRole("button", { name: "Guardar" }), 1200);
    await e.resaltar(sesion("Lactancia materna").getByRole("alert"), 2600);
    await e.clic(sesion("Lactancia materna").getByRole("button", { name: "Cancelar" }), 1000);
    await e.resaltar(sesion("Lactancia materna"), 1600);

    // ── US2-4 (sin reservas)
    await e.escenario("US2-4", "Quitar una sesión sin reservas", "«Salud mental…» no tiene reservas ni asistencias: se quita y vuelve a «pendientes».");
    await e.clic(sesion("Salud mental").getByRole("button", { name: "Quitar" }), 1500);
    await e.resaltar(p.getByTestId("pendiente").filter({ hasText: "Salud mental" }), 2200);

    // ── US3-1
    await e.escenario("US3-1", "Publicar el programa", "La organizadora publica: el programa pasa a «Publicado».");
    await e.arriba();
    await e.clic(p.getByRole("button", { name: "Publicar programa" }), 1500);
    await e.resaltar(p.getByText("Publicado", { exact: true }), 2000);

    // ── US3-4
    await e.escenario("US3-4", "Cambios después de publicar", "Con el programa ya publicado, «Alergias alimentarias» pasa a la Sala B. El público lo verá en su próxima visita.");
    const filaAl = sesion("Alergias alimentarias");
    await e.clic(filaAl.getByRole("button", { name: "Cambiar" }), 800);
    await e.elegir(filaAl.getByLabel("Sala"), { contiene: "Sala B" });
    await e.clic(filaAl.getByRole("button", { name: "Guardar" }), 1400);
    await e.resaltar(sesion("Alergias alimentarias"), 1800);

    // ── US3-1 (vista pública) / US3-5
    await e.salir();
    await e.escenario("US3-1", "El programa público", "Sin iniciar sesión: sesiones agrupadas por día y ordenadas por hora, con sala, área y ponente.");
    await e.ir(PUB, 1500);
    for (const s of await p.getByTestId("sesion-publica").all()) await e.resaltar(s, 900);
    await e.narrar("«Alergias alimentarias» ya aparece en la Sala B.", 2000);
    await e.escenario("US3-5", "Detalle de una sesión", "Cada sesión tiene su propia URL indexable con resumen, ponente, sala y horario.");
    await e.clic(p.getByRole("link", { name: /Vacunación en la adolescencia/ }), 1500);
    await e.resaltar(p.getByRole("heading", { level: 1 }), 1500);
    await e.resaltar(p.getByText("Ponente: Pablo Ponente"), 2000);

    // ── US3-3
    await e.escenario("US3-3", "Preparado para buscadores (SEO)", "El HTML llega completo desde el servidor, sin JavaScript: título, descripción, canónica, Open Graph y JSON-LD de evento.");
    const html = await (await p.request.get(PUB)).text();
    const trozo = (re: RegExp) => html.match(re)?.[0] ?? "(no encontrado)";
    const jsonld = trozo(/<script type="application\/ld\+json">[\s\S]{0,170}/);
    await e.consola(
      "HTML recibido por un buscador (sin ejecutar JavaScript)",
      `GET ${PUB}`,
      [trozo(/<title>[^<]*<\/title>/), trozo(/<meta name="description"[^>]*>/), trozo(/<link rel="canonical"[^>]*>/), trozo(/<meta property="og:title"[^>]*>/), `${jsonld}…`, `…contiene «Vacunación en la adolescencia»: ${html.includes("Vacunación en la adolescencia") ? "sí" : "no"}`].join("\n"),
      true,
      8500,
    );
    await e.ocultarConsola();
    await e.ir("/sitemap.xml", 2600);
    await e.narrar("El programa publicado está en sitemap.xml…", 1500);
    await e.ir("/robots.txt", 1500);
    await e.narrar("…y robots.txt excluye las zonas privadas (organizador, comité, área personal…).", 3000);

    // ── Congreso en curso: US2-3, US2-4 (con reservas), US2-5
    await db.entradaAgenda.create({
      data: {
        sesionId: await idSesion("Gamificación con recursos abiertos"),
        inscripcionId: (await db.inscripcion.findFirstOrThrow({ where: { usuario: { email: "asistente3@congresalia.es" }, congreso: { slug: "congreso-innovacion-educativa-2026" } } })).id,
      },
    });
    await e.entrar("organizador@congresalia.es");
    await e.escenario("US2-3", "Mover a una sala más pequeña que las reservas", "En el Congreso de Innovación Educativa, «Gamificación…» tiene 3 reservas. El Aula 3 solo tiene aforo 2.");
    await e.aviso("Dato preparado en BD: Asistente 3 también ha reservado «Gamificación…» (3 reservas)");
    await e.ir("/organizador/congreso-innovacion-educativa-2026/programa", 1500);
    const gam = sesion("Gamificación con recursos abiertos");
    await e.resaltar(gam, 1500);
    await e.clic(gam.getByRole("button", { name: "Cambiar" }), 800);
    await e.elegir(gam.getByLabel("Sala"), { contiene: "Aula 3" });
    await e.clic(gam.getByRole("button", { name: "Guardar" }), 1200);
    await e.resaltar(gam.getByRole("alert"), 2600);
    await e.clic(gam.getByRole("button", { name: "Cancelar" }), 800);
    await e.aviso(null);

    await e.escenario("US2-4", "Quitar una sesión con reservas", "Quitarla dejaría a 3 personas sin su sesión: se impide.");
    await e.clic(gam.getByRole("button", { name: "Quitar" }), 1200);
    await e.resaltar(gam.getByRole("alert"), 2600);

    await e.escenario("US2-5", "Una sesión que ya ha empezado", "«Aprendizaje basado en proyectos…» está en marcha: no se puede quitar ni cambiar de hora, solo de sala.");
    const abp = sesion("Aprendizaje basado en proyectos");
    await e.resaltar(abp, 1800);
    await e.clic(abp.getByRole("button", { name: "Cambiar de sala" }), 1200);
    await e.resaltar(abp.getByLabel("Sala"), 1500);
    await e.narrar("Solo aparece el selector de sala: las horas no se pueden tocar. Ahora mismo todas las salas están ocupadas:", 1200);
    await e.elegir(abp.getByLabel("Sala"), { contiene: "Sala Magna" });
    await e.clic(abp.getByRole("button", { name: "Guardar" }), 1200);
    await e.resaltar(abp.getByRole("alert"), 2400);
    await e.clic(abp.getByRole("button", { name: "Cancelar" }), 600);
    await e.peticion("programa.mover", { sesionId: await idSesion("Aprendizaje basado en proyectos en secundaria"), dia: diaISO(new Date()), horaInicio: "20:00", horaFin: "21:00" });
    await e.ocultarConsola();

    // ── US2-6
    await e.escenario("US2-6", "Congreso finalizado", "En el Simposio de Salud Digital (ya terminado) el programa queda congelado.");
    await e.ir("/organizador/simposio-salud-digital-2026/programa", 1500);
    await e.resaltar(p.getByText("El congreso ha finalizado: el programa ya no se puede modificar."), 2200);
    await e.peticion("programa.quitar", { sesionId: await idSesion("Teleconsulta en atención primaria") });
    await e.ocultarConsola();

    // ── US1-7
    await e.entrar("asistente1@congresalia.es");
    await e.escenario("US1-7", "Solo la organización toca el programa", "Una asistente intenta abrir la gestión del programa y mover una sesión.");
    await e.ir(ORG, 1800);
    await e.peticion("programa.quitar", { sesionId: await idSesion("Vacunación en la adolescencia: retos actuales") });
  },
};
