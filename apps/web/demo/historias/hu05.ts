import { db, idSesion } from "../lib/db";
import type { Historia } from "../lib/tipos";
import { diaLocal, entrarEn, horaLocal, trpcEn } from "../lib/ventana";

const SLUG = "congreso-innovacion-educativa-2026";
const AGENDA = `/area-personal/agenda/${SLUG}`;

/** HU-05 · Construir mi agenda personal (spec-005). */
export const hu05: Historia = {
  id: "hu05",
  hu: "HU-05",
  titulo: "Construir mi agenda personal",
  async guion(e, h) {
    const p = e.page;
    const sesion = (t: string) => p.getByTestId("sesion-programa").filter({ hasText: t });
    // por el título exacto: el aviso «Se solapa con «…»» de otra fila también contiene el título
    const enAgenda = (t: string) => p.getByTestId("en-mi-agenda").filter({ has: p.locator("div.font-medium", { hasText: t }) });
    const gamificacion = await idSesion("Gamificación con recursos abiertos");
    const competencia = await idSesion("Competencia digital docente");
    const coevaluacion = await idSesion("Coevaluación entre iguales");
    const aprendizaje = await idSesion("Aprendizaje basado en proyectos en secundaria");

    await e.portada("HU-05", "Construir mi agenda personal", "Como <b>asistente inscrito</b>, quiero añadir a mi agenda las sesiones a las que quiero ir para organizar mi congreso.", [
      "Solo con la inscripción confirmada",
      "Sin sesiones que se solapen (las contiguas sí) y sin superar el aforo",
      "Quitar sesiones que aún no han empezado",
      "Aviso si el organizador mueve una sesión y provoca un solape",
    ]);

    // ── US1-6
    await e.entrar("asistente4@congresalia.es");
    await e.escenario("US1-6", "Inscripción pendiente de pago: sin agenda", "Asistente 4 aún no ha pagado su inscripción al Congreso de Innovación Educativa.");
    await e.ir("/area-personal/agenda", 1200);
    await e.resaltar(p.getByText("No tienes inscripciones confirmadas.", { exact: false }), 2000);
    await e.ir(AGENDA, 1800);
    await e.peticion("agenda.anadir", { sesionId: gamificacion });
    await e.ocultarConsola();

    // ── US1-1
    await e.entrar("asistente3@congresalia.es");
    await e.escenario("US1-1", "Añadir una sesión", "Asistente 3 (inscripción confirmada) añade «Gamificación…»: aparece en su agenda y quedan menos plazas.");
    await e.clic(p.getByRole("link", { name: "Área personal" }), 1000);
    await e.clic(p.getByTestId("inscripcion").filter({ hasText: "Innovación Educativa" }).getByRole("link", { name: "Mi agenda" }), 1200);
    await e.resaltar(p.getByText("Todavía no has añadido sesiones."), 1500);
    await e.resaltar(sesion("Gamificación con recursos abiertos"), 2000);
    await e.clic(sesion("Gamificación con recursos abiertos").getByRole("button", { name: "Añadir" }), 1500);
    await e.resaltar(enAgenda("Gamificación con recursos abiertos"), 1600);
    await e.resaltar(sesion("Gamificación con recursos abiertos"), 2200);

    // ── Estados
    await e.escenario("Estados", "Sesiones ya empezadas", "Las sesiones en marcha muestran «Ya empezada» y no se pueden añadir.");
    await e.resaltar(sesion("Rúbricas compartidas"), 2000);

    // ── US1-2
    await e.escenario("US1-2", "Sesiones que se solapan", "«Evaluación formativa…» empieza antes de que acabe «Gamificación…»: se rechaza indicando el choque.");
    await e.clic(sesion("Evaluación formativa con portafolios").getByRole("button", { name: "Añadir" }), 1200);
    await e.resaltar(sesion("Evaluación formativa con portafolios").getByRole("alert"), 2600);

    // ── US1-3
    await e.escenario("US1-3", "Sesiones contiguas", "«Aula invertida…» empieza justo cuando termina «Gamificación…»: no se solapan y se acepta.");
    await e.clic(sesion("Aula invertida").getByRole("button", { name: "Añadir" }), 1500);
    await e.resaltar(enAgenda("Aula invertida"), 2000);

    // ── US1-7
    await e.escenario("US1-7", "Añadir dos veces la misma sesión", "Petición directa para volver a añadir «Gamificación…».");
    await e.peticion("agenda.anadir", { sesionId: gamificacion });
    await e.ocultarConsola();

    // ── US1-5
    await e.escenario("US1-5", "Dos personas a por la última plaza", "«Competencia digital docente» (Aula 3, aforo 2) tiene 1 plaza libre. Dos asistentes la reservan a la vez desde sus móviles.");
    await e.resaltar(sesion("Competencia digital docente"), 1800);
    const [v1, v2] = [await h.nuevaVentana(), await h.nuevaVentana()];
    await entrarEn(v1, "asistente2@congresalia.es");
    await entrarEn(v2, "demo01@congresalia.es");
    const [r1, r2] = await Promise.all([trpcEn(v1, "agenda.anadir", { sesionId: competencia }), trpcEn(v2, "agenda.anadir", { sesionId: competencia })]);
    console.log(`   [US1-5] simultáneas → ${r1.status} ${r1.mensaje} | ${r2.status} ${r2.mensaje}`);
    await e.consola(
      "Dos peticiones simultáneas a agenda.anadir",
      `POST /api/trpc/agenda.anadir  (Asistente 2)\nPOST /api/trpc/agenda.anadir  (Asistente demo 1)\n{ "sesionId": "${competencia}" }`,
      `Asistente 2       ← ${r1.status} ${r1.mensaje}\nAsistente demo 1  ← ${r2.status} ${r2.mensaje}\n\nSolo una se acepta: la reserva bloquea la sesión en la transacción.`,
      true,
      7000,
    );
    await e.ocultarConsola();

    // ── US1-4
    await e.escenario("US1-4", "Sesión con el aforo completo", "Para Asistente 3 la sesión aparece ya como «Completa»; y el servidor lo confirma.");
    await p.reload();
    await e.resaltar(sesion("Competencia digital docente"), 2400);
    await e.peticion("agenda.anadir", { sesionId: competencia });
    await e.ocultarConsola();

    // ── US2-1
    await e.escenario("US2-1", "Mi agenda, ordenada por día y hora", "Añade también «Coevaluación entre iguales» para mañana: la agenda se ordena por día y hora, con sala y horario.");
    await e.clic(sesion("Coevaluación entre iguales").getByRole("button", { name: "Añadir" }), 1500);
    await e.arriba();
    for (const t of await p.getByTestId("en-mi-agenda").all()) await e.resaltar(t, 1100);

    // ── US2-4
    await e.escenario("US2-4", "El organizador mueve una sesión y provoca un solape", "En otra ventana, la organizadora adelanta «Coevaluación…» a hoy, al Aula 3, en mitad de «Gamificación…».");
    const org = await h.nuevaVentana();
    await entrarEn(org, "organizador@congresalia.es");
    const gam = await db.sesion.findUniqueOrThrow({ where: { id: gamificacion } });
    const nuevoInicio = new Date(gam.inicio.getTime() - 30 * 60_000);
    const nuevoFin = new Date(gam.inicio.getTime() + 30 * 60_000);
    const aula3 = await db.sala.findFirstOrThrow({ where: { nombre: "Aula 3", congreso: { slug: SLUG } } });
    const r = await trpcEn(org, "programa.mover", { sesionId: coevaluacion, salaId: aula3.id, dia: diaLocal(nuevoInicio), horaInicio: horaLocal(nuevoInicio), horaFin: horaLocal(nuevoFin) });
    console.log(`   [US2-4] mover coevaluación → ${r.status} ${r.mensaje}`);
    await org.goto(`/organizador/${SLUG}/programa`);
    await org.getByTestId("sesion-org").filter({ hasText: "Coevaluación" }).scrollIntoViewIfNeeded();
    await e.pip(`Ventana de la organizadora: «Coevaluación…» ahora a las ${horaLocal(nuevoInicio)}, Aula 3`, org, 4500);
    await e.narrar("Asistente 3 vuelve a abrir su agenda…", 800);
    await p.reload();
    await e.ocultarConsola();
    await e.resaltar(enAgenda("Coevaluación"), 2200);
    await e.resaltar(enAgenda("Gamificación"), 2200);

    // ── US2-2
    await e.escenario("US2-2", "Quitar una sesión futura", "Quita «Coevaluación…»: desaparece de su agenda, el aviso de solape se va y la sesión recupera la plaza.");
    await e.resaltar(sesion("Coevaluación entre iguales"), 1400);
    await e.clic(enAgenda("Coevaluación").getByRole("button", { name: "Quitar" }), 1500);
    await e.resaltar(enAgenda("Gamificación"), 1400);
    await e.resaltar(sesion("Coevaluación entre iguales"), 2200);

    // ── US2-3
    await e.entrar("asistente1@congresalia.es");
    await e.escenario("US2-3", "Quitar una sesión que ya ha empezado", "Asistente 1 tiene en su agenda una sesión en marcha: no ofrece «Quitar» (afectaría a su certificado).");
    await e.ir(AGENDA, 1200);
    await e.resaltar(enAgenda("Aprendizaje basado en proyectos"), 2200);
    await e.peticion("agenda.quitar", { sesionId: aprendizaje });
  },
};
