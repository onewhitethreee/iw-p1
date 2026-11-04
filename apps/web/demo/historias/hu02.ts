import { db, idPropuesta, idUsuario } from "../lib/db";
import type { Historia } from "../lib/tipos";

const PROPUESTAS = "/organizador/jornadas-pediatria-2027/propuestas";

/** HU-02 · Evaluar propuestas de forma anónima (spec-002). */
export const hu02: Historia = {
  id: "hu02",
  hu: "HU-02",
  titulo: "Evaluar propuestas de forma anónima",
  async guion(e) {
    const p = e.page;
    const fila = (titulo: string) => p.getByTestId("fila-propuesta-org").filter({ hasText: titulo });
    const asignacion = (titulo: string) => p.getByTestId("fila-asignacion").filter({ hasText: titulo });
    const bronquiolitis = await idPropuesta("Bronquiolitis: actualización del protocolo de urgencias");
    const canguro = await idPropuesta("Método canguro en prematuros extremos");
    const ajena = await db.asignacion.findFirstOrThrow({ where: { evaluador: { email: "comite2@congresalia.es" }, propuesta: { titulo: "Método canguro en prematuros extremos" } } });

    await e.portada("HU-02", "Evaluar propuestas de forma anónima", "Como <b>miembro del comité científico</b>, quiero evaluar las propuestas asignadas con una puntuación y comentarios para seleccionar las mejores ponencias.", [
      "El evaluador solo ve sus propuestas asignadas, sin la autoría",
      "Puntuación de 1 a 10 y comentarios; modificable hasta la decisión",
      "El organizador asigna evaluadores (nunca al propio autor)",
      "No se acepta ni rechaza sin al menos 2 evaluaciones",
    ]);

    // ── US1-1
    await e.entrar("comite1@congresalia.es");
    await e.escenario("US1-1", "Mis evaluaciones, sin autoría", "Carmen Comité ve solo lo que tiene asignado: título, área y estado. Nunca el autor.");
    await e.clic(p.getByRole("link", { name: "Mis evaluaciones" }), 1200);
    await e.resaltar(p.getByText("La revisión es anónima: no se muestra la autoría de las propuestas."), 1800);
    await e.resaltar(asignacion("Uso racional de antibióticos"), 2000);

    // ── US1-3
    await e.escenario("US1-3", "Evaluación incompleta", "Sin puntuación y con un comentario de 5 caracteres: se indica cada error.");
    await e.clic(asignacion("Uso racional de antibióticos").getByRole("link", { name: "Evaluar" }), 1200);
    await e.resaltar(p.getByTestId("titulo-propuesta"), 1400);
    await e.narrar("La ficha muestra título, área y resumen… pero ningún dato de quién la escribió.", 2200);
    await e.escribir(p.getByLabel("Comentarios"), "Corto");
    await e.clic(p.getByRole("button", { name: "Guardar evaluación" }), 900);
    await e.resaltar(p.getByText("Los comentarios deben tener entre 10 y 2000 caracteres"), 1800);

    // ── US1-2
    await e.escenario("US1-2", "Guardar una evaluación", "Puntuación 8 y un comentario válido: la propuesta pasa a «Evaluada (8)».");
    await e.elegir(p.getByLabel(/Puntuación/), "8");
    await e.escribir(p.getByLabel("Comentarios"), "Buen planteamiento clínico; conviene detallar la muestra.");
    await e.clic(p.getByRole("button", { name: "Guardar evaluación" }), 1200);
    await e.resaltar(p.getByText("Evaluación guardada."), 1500);
    await e.clic(p.getByRole("link", { name: "← Mis evaluaciones" }), 1000);
    await e.resaltar(asignacion("Uso racional de antibióticos"), 2000);

    // ── US1-5
    await e.escenario("US1-5", "Modificar mi evaluación antes de la decisión", "Carmen la revisa y baja la nota a 2: sigue habiendo una sola evaluación suya.");
    await e.clic(asignacion("Uso racional de antibióticos").getByRole("link", { name: "Ver" }), 1200);
    await e.elegir(p.getByLabel(/Puntuación/), "2");
    await e.escribir(p.getByLabel("Comentarios"), "Tras releerla, la metodología no sostiene las conclusiones.");
    await e.clic(p.getByRole("button", { name: "Actualizar evaluación" }), 1200);
    await e.clic(p.getByRole("link", { name: "← Mis evaluaciones" }), 1000);
    await e.resaltar(asignacion("Uso racional de antibióticos"), 2000);

    // ── US1-4
    await e.escenario("US1-4", "Propuesta no asignada", "Carmen intenta abrir la evaluación que tiene asignada otro miembro del comité.");
    await e.ir(`/comite/evaluar/${ajena.id}`, 2200);
    await e.peticion("evaluacion.evaluar", { asignacionId: ajena.id, puntuacion: 10, comentarios: "Intento evaluar algo que no es mío." });
    await e.ocultarConsola();

    // ── US2-1
    await e.entrar("organizador@congresalia.es");
    await e.escenario("US2-1", "Asignar un evaluador", "La organizadora asigna «Bronquiolitis…» a Clara Comité: pasa de «Enviada» a «En evaluación».");
    await e.ir(PROPUESTAS, 1200);
    await e.resaltar(fila("Bronquiolitis"), 1600);
    await e.elegir(fila("Bronquiolitis").getByLabel("Asignar evaluador"), { label: "Clara Comité" });
    await e.clic(fila("Bronquiolitis").getByRole("button", { name: "Asignar" }), 1500);
    await e.resaltar(fila("Bronquiolitis"), 2200);

    // ── US2-2
    await e.escenario("US2-2", "No se asigna al propio autor", "Pedro es ponente y comité: no puede evaluar su propia propuesta.");
    await e.elegir(fila("Alimentación complementaria").getByLabel("Asignar evaluador"), { label: "Pedro Ponente-Comité" });
    await e.clic(fila("Alimentación complementaria").getByRole("button", { name: "Asignar" }), 900);
    await e.resaltar(fila("Alimentación complementaria").getByRole("alert"), 2400);

    // ── US2-3 / US2-4
    await e.escenario("US2-3", "Evaluador ya asignado", "La lista ya no ofrece a Clara para «Bronquiolitis…»; si se fuerza la petición, el servidor la rechaza.");
    await e.peticion("evaluacion.asignar", { propuestaId: bronquiolitis, evaluadorId: await idUsuario("comite3@congresalia.es") });
    await e.escenario("US2-4", "Asignar a alguien que no es del comité", "Intento de asignar a un ponente como evaluador.");
    await e.peticion("evaluacion.asignar", { propuestaId: bronquiolitis, evaluadorId: await idUsuario("ponente2@congresalia.es") });
    await e.ocultarConsola();

    // ── US3-2
    await e.escenario("US3-2", "Decidir con menos de 2 evaluaciones", "«Obesidad infantil…» aún no tiene evaluaciones: aceptarla se rechaza en el servidor.");
    await e.resaltar(fila("Obesidad infantil"), 1400);
    await e.clic(fila("Obesidad infantil").getByRole("button", { name: "Aceptar" }), 900);
    await e.resaltar(fila("Obesidad infantil").getByRole("alert"), 2400);

    // ── US3-4 / US3-1
    await e.escenario("US3-4", "Lista del organizador ordenada por media", "Aquí sí se ve la autoría, el nº de evaluaciones, la media y el estado.");
    await e.clic(p.getByRole("link", { name: "Ordenar por media" }), 1500);
    await e.resaltar(fila("Método canguro"), 2200);
    await e.escenario("US3-1", "Aceptar con 2 evaluaciones", "«Método canguro…» (media 8,5) queda aceptada y lista para programarse.");
    await e.clic(fila("Método canguro").getByRole("button", { name: "Aceptar" }), 1500);
    await e.resaltar(fila("Método canguro"), 2200);

    // ── US3-5
    await e.escenario("US3-5", "No hay nota mínima", "«Uso racional…» tiene 7 y 2 (media 4,5): con dos evaluaciones se puede aceptar igualmente.");
    await e.resaltar(fila("Uso racional"), 1800);
    await e.clic(fila("Uso racional").getByRole("button", { name: "Aceptar" }), 1500);
    await e.resaltar(fila("Uso racional"), 2000);

    // ── US3-3
    await e.escenario("US3-3", "Decidir dos veces", "«Método canguro…» ya está aceptada: rechazarla ahora se impide.");
    await e.peticion("evaluacion.decidir", { propuestaId: canguro, decision: "RECHAZAR" });
    await e.ocultarConsola();

    // ── US2-5
    await e.entrar("comite1@congresalia.es");
    await e.escenario("US2-5", "Solo el organizador asigna", "Carmen (comité) intenta asignarse una propuesta mediante una petición directa.");
    await e.peticion("evaluacion.asignar", { propuestaId: bronquiolitis, evaluadorId: await idUsuario("comite1@congresalia.es") });
    await e.ocultarConsola();

    // ── US1-6
    await e.escenario("US1-6", "Evaluación de una propuesta ya decidida", "Carmen abre «Método canguro…»: la evaluación queda en solo lectura.");
    await e.ir("/comite", 900);
    await e.clic(asignacion("Método canguro").getByRole("link", { name: "Ver" }), 1200);
    await e.resaltar(p.getByText("La propuesta ya está decidida: tu evaluación no se puede modificar."), 2000);
    await e.resaltar(p.getByLabel(/Puntuación/), 1400);
    const suya = await db.asignacion.findFirstOrThrow({ where: { evaluador: { email: "comite1@congresalia.es" }, propuestaId: canguro } });
    await e.peticion("evaluacion.evaluar", { asignacionId: suya.id, puntuacion: 3, comentarios: "Cambio la nota después de decidir." });
  },
};
