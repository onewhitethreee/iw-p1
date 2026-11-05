import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import QRCode from "qrcode";
import { codigoDe, db, idSesion } from "../lib/db";
import type { Escena } from "../lib/escena";
import type { Historia } from "../lib/tipos";
import { entrarEn } from "../lib/ventana";

const EDU = "congreso-innovacion-educativa-2026";
const CAMARA = join(tmpdir(), "congresalia-demo-qr.y4m");

async function abrirPuerta(e: Escena, titulo: string) {
  const p = e.page;
  await e.ir(`/acreditacion/${EDU}`, 900);
  await e.clic(p.getByTestId("sesion-acreditacion").filter({ hasText: titulo }).getByRole("link", { name: titulo }), 1200);
  await p.getByRole("heading", { name: titulo }).waitFor();
}

async function validar(e: Escena, codigo: string) {
  await e.escribir(e.page.getByLabel("Código de acreditación"), codigo, 300);
  await e.clic(e.page.getByRole("button", { name: "Validar" }), 1000);
}

/** HU-06 · Controlar el acceso a la sala con QR (spec-006). */
export const hu06: Historia = {
  id: "hu06",
  hu: "HU-06",
  titulo: "Controlar el acceso a la sala con QR",
  /** Cámara simulada de Chromium que «enseña» el QR de Asistente demo 3 (Asistente 2 ya está en otra sala a esa hora). */
  async preparar() {
    const png = join(tmpdir(), "congresalia-demo-qr.png");
    await QRCode.toFile(png, await codigoDe("demo03@congresalia.es", EDU), { width: 210, margin: 2 });
    execFileSync("ffmpeg", ["-v", "error", "-y", "-loop", "1", "-i", png, "-t", "4", "-r", "10", "-vf", "scale=210:210,pad=640:480:(ow-iw)/2:(oh-ih)/2:white,format=yuv420p", CAMARA]);
    return { args: [`--use-file-for-fake-video-capture=${CAMARA}`] };
  },
  async guion(e, h) {
    const p = e.page;
    const resultado = p.getByTestId("resultado");
    const ocupacion = p.getByTestId("ocupacion");
    const a3 = await codigoDe("asistente3@congresalia.es", EDU);
    const otroCongreso = await codigoDe("asistente1@congresalia.es", "simposio-salud-digital-2026");

    await e.portada("HU-06", "Controlar el acceso a la sala con QR", "Como <b>personal de acreditación</b>, quiero escanear el QR del asistente a la entrada de la sala para controlar el aforo y registrar la asistencia real.", [
      "Escaneo con la cámara o, si no se lee, el código escrito a mano",
      "Rechazo por aforo completo, QR no válido, de otro congreso o no confirmado",
      "Cada entrada aceptada se registra como asistencia (sin contar dos veces)",
      "Ocupación de la sala actualizada en la puerta",
    ]);

    // Acreditación de Asistente demo 3
    await e.entrar("demo03@congresalia.es");
    await e.escenario("Previo", "La acreditación del asistente", "Asistente demo 3 tiene su inscripción confirmada: en su área personal está su QR y el código impreso debajo.");
    await e.clic(p.getByRole("link", { name: "Área personal" }), 1000);
    await e.resaltar(p.getByTestId("inscripcion").filter({ hasText: "Innovación Educativa" }), 3000);

    // Lista de sesiones
    await e.entrar("acreditacion@congresalia.es");
    await e.escenario("Puerta", "Elegir la sesión que se controla", "Ángel (acreditación) ve las sesiones del congreso en curso; cada sala se abre 30 minutos antes.");
    await e.ir("/acreditacion", 900);
    await e.clic(p.getByTestId("congreso-acreditacion").filter({ hasText: "Innovación Educativa" }), 1200);
    await e.resaltar(p.getByTestId("sesion-acreditacion").filter({ hasText: "Aprendizaje basado en proyectos" }), 1800);

    // ── US1-1 con la cámara
    await e.escenario("US1-1", "Escanear un QR válido con la cámara", "Asistente demo 3 enseña su QR: «Admitido», con su nombre; se registra la asistencia y la ocupación sube.");
    await e.clic(p.getByTestId("sesion-acreditacion").filter({ hasText: "Aprendizaje basado en proyectos" }).getByRole("link", { name: "Aprendizaje basado en proyectos en secundaria" }), 1200);
    await e.resaltar(ocupacion, 1500);
    await e.clic(p.getByRole("button", { name: "Escanear con la cámara" }), 300);
    await resultado.waitFor({ timeout: 20_000 });
    await e.pausa(1800);
    await e.clic(p.getByRole("button", { name: "Detener la cámara" }), 800);
    await e.resaltar(resultado, 2200);
    await e.resaltar(ocupacion, 1800);

    // ── US1-7
    await e.escenario("US1-7", "Código escrito a mano", "Si la cámara no puede leer el QR, se escribe el código: el resultado es el mismo. Entra Asistente 3.");
    await validar(e, a3);
    await e.resaltar(resultado, 2000);
    await e.resaltar(ocupacion, 1500);

    // ── US1-5
    await e.escenario("US1-5", "Sale y vuelve a entrar", "Asistente 3 vuelve a pasar: «Ya registrado» en ámbar; puede pasar, pero no cuenta otra vez ni consume aforo.");
    await validar(e, `  ${a3}  `);
    await e.resaltar(resultado, 2200);
    await e.resaltar(ocupacion, 1800);

    // ── US1-8 (clarify-3 P4)
    await e.escenario("US1-8", "Nadie está en dos sesiones a la vez", "Asistente 2 ya entró en «Rúbricas compartidas…» (Aula 3), que se celebra a la misma hora: no puede entrar también en el Auditorio.");
    await validar(e, await codigoDe("asistente2@congresalia.es", EDU));
    await e.resaltar(resultado, 2600);
    await e.resaltar(ocupacion, 1500);
    await e.narrar("No se registra la asistencia ni se ocupa plaza. En una sesión que empiece cuando acaba la otra, sí podría entrar.", 2000);

    // ── US2-1
    await e.escenario("US2-1", "Otra puerta de la misma sala", "Por otra puerta del Auditorio entra otra asistente. Sin recargar, esta pantalla actualiza la ocupación en pocos segundos.");
    const otra = await h.nuevaVentana();
    await entrarEn(otra, "acreditacion@congresalia.es");
    await otra.goto(`/acreditacion/${EDU}/${await idSesion("Aprendizaje basado en proyectos en secundaria")}`);
    await otra.getByLabel("Código de acreditación").fill(await codigoDe("demo02@congresalia.es", EDU));
    await otra.getByRole("button", { name: "Validar" }).click();
    await otra.getByTestId("resultado").waitFor();
    await e.pip("Otra puerta (otra tableta)", otra, 600);
    await p.getByText(/^4 \/ 200$/).waitFor({ timeout: 8000 });
    await e.resaltar(ocupacion, 2600);
    await e.ocultarConsola();

    // ── US1-3
    await e.escenario("US1-3", "Código que no existe", "Un código inventado se rechaza.");
    await validar(e, "codigo-inventado-123");
    await e.resaltar(resultado, 2200);

    // ── US1-4
    await e.escenario("US1-4", "Acreditación de otro congreso o no confirmada", "Primero, la acreditación de Asistente 1 para el Simposio de Salud Digital…");
    await validar(e, otroCongreso);
    await e.resaltar(resultado, 2200);
    const pendiente = await db.inscripcion.findFirstOrThrow({ where: { usuario: { email: "asistente4@congresalia.es" }, congreso: { slug: EDU } } });
    await db.inscripcion.update({ where: { id: pendiente.id }, data: { codigoAcreditacion: "ACRED-ASISTENTE4-PENDIENTE" } });
    await e.aviso("Dato preparado en BD: código emitido para la inscripción pendiente de Asistente 4");
    await e.narrar("…y después un código de una inscripción que está pendiente de pago.", 1000);
    await validar(e, "ACRED-ASISTENTE4-PENDIENTE");
    await e.resaltar(resultado, 2400);
    await e.aviso(null);

    // ── Ventana de acceso
    await e.escenario("Ventana", "Una sesión que aún no ha abierto", "«Gamificación…» empieza dentro de dos horas: la puerta no admite todavía.");
    await abrirPuerta(e, "Gamificación con recursos abiertos");
    await validar(e, a3);
    await e.resaltar(resultado, 2400);

    // ── US1-2
    await e.escenario("US1-2", "Sala con el aforo completo", "«Rúbricas compartidas…» se celebra en el Aula 3 (aforo 2) y ya hay 2 personas dentro. Llega Asistente demo 4.");
    await abrirPuerta(e, "Rúbricas compartidas entre departamentos");
    await e.resaltar(ocupacion, 1500);
    await validar(e, await codigoDe("demo04@congresalia.es", EDU));
    await e.resaltar(resultado, 2200);
    await e.resaltar(ocupacion, 1500);

    // ── US1-9 (spec-005 clarify-2 P2): las reservas no presentadas se liberan a los 10 min
    await e.escenario("US1-9", "Plazas reservadas de quien no se presenta", "«Competencia digital docente» (Aula 3, aforo 2) tiene sus 2 plazas reservadas y nadie ha entrado. Llega Asistente demo 5, sin reserva.");
    const competencia = await db.sesion.findFirstOrThrow({ where: { propuesta: { titulo: "Competencia digital docente" } } });
    const extra = await db.inscripcion.findFirstOrThrow({ where: { usuario: { email: "demo06@congresalia.es" }, congreso: { slug: EDU } } });
    const reservaExtra = await db.entradaAgenda.create({ data: { inscripcionId: extra.id, sesionId: competencia.id } });
    const mover = (minDesdeInicio: number) =>
      db.sesion.update({ where: { id: competencia.id }, data: { inicio: new Date(Date.now() - minDesdeInicio * 60_000), fin: new Date(Date.now() + (60 - minDesdeInicio) * 60_000) } });
    await mover(5);
    await e.aviso("Dato preparado en BD: la sesión empezó hace 5 minutos y tiene 2 reservas (Asistente 1 y Asistente demo 6)");
    const a5 = await codigoDe("demo05@congresalia.es", EDU);
    await abrirPuerta(e, "Competencia digital docente");
    await e.resaltar(ocupacion, 1400);
    await validar(e, a5);
    await e.resaltar(resultado, 2400);
    await e.narrar("Durante los primeros 10 minutos, las plazas reservadas siguen guardadas para quien reservó.", 1800);
    await mover(11);
    await e.aviso("Dato preparado en BD: ahora la sesión empezó hace 11 minutos");
    await e.pausa(1200);
    await validar(e, a5);
    await e.resaltar(resultado, 2400);
    await e.resaltar(ocupacion, 1600);
    await e.narrar("Pasados 10 minutos, quien no se ha presentado pierde la plaza; la sesión sigue en su agenda.", 2000);
    await db.asistencia.deleteMany({ where: { sesionId: competencia.id } });
    await db.entradaAgenda.delete({ where: { id: reservaExtra.id } });
    await db.sesion.update({ where: { id: competencia.id }, data: { inicio: competencia.inicio, fin: competencia.fin } });
    await e.aviso(null);

    // ── Sin conexión
    await e.escenario("Sin red", "Se cae la conexión", "La validación avisa en español y la ocupación se marca «sin actualizar»; al volver la red, todo se recupera.");
    await abrirPuerta(e, "Aprendizaje basado en proyectos en secundaria");
    await p.route("**/api/trpc/**", (r) => r.abort("internetdisconnected"));
    await e.aviso("Red desconectada");
    await validar(e, "cualquier-codigo");
    await e.resaltar(p.getByRole("alert").filter({ hasText: "Sin conexión" }), 1800);
    await p.getByText("Ocupación sin actualizar").waitFor({ timeout: 10_000 });
    await e.resaltar(p.getByText("Ocupación sin actualizar"), 1800);
    await p.unroute("**/api/trpc/**");
    await e.aviso("Red recuperada");
    await p.getByText("Ocupación sin actualizar").waitFor({ state: "detached", timeout: 10_000 });
    await e.resaltar(ocupacion, 1800);
    await e.aviso(null);

    // ── US1-6
    await e.entrar("asistente1@congresalia.es");
    await e.escenario("US1-6", "Sin el rol de acreditación", "Una asistente no puede abrir el escáner ni registrar asistencias con una petición directa.");
    await e.ir("/acreditacion", 1800);
    await e.peticion("acreditacion.escanear", { sesionId: await idSesion("Aprendizaje basado en proyectos en secundaria"), codigo: a3 });
  },
};
