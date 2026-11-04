import { idCongreso } from "../lib/db";
import type { Escena } from "../lib/escena";
import type { Historia } from "../lib/tipos";

async function abrir(e: Escena, congreso: string) {
  const p = e.page;
  await e.clic(p.getByRole("link", { name: "Área personal" }), 900);
  await e.clic(p.getByRole("link", { name: /Certificado/ }), 1000);
  await e.clic(p.getByTestId("congreso-certificado").filter({ hasText: congreso }), 1200);
  await p.getByRole("heading", { name: congreso }).waitFor();
}

/** Muestra la respuesta HTTP de la URL de descarga del certificado con la sesión actual. */
async function pedirPdf(e: Escena, congresoId: string, titulo: string) {
  const r = await e.page.request.get(`/api/certificado/${congresoId}`);
  const cuerpo = r.headers()["content-type"]?.includes("pdf") ? `(PDF, ${(await r.body()).length} bytes)` : await r.text();
  console.log(`   [${e.capitulos.at(-1)?.escenario}] GET certificado → ${r.status()} ${cuerpo.slice(0, 140)}`);
  await e.consola(titulo, `GET /api/certificado/${congresoId}`, `← ${r.status()}\n${cuerpo}`, r.ok(), 6000);
  await e.ocultarConsola();
}

/** HU-07 · Descargar el certificado de asistencia (spec-007). */
export const hu07: Historia = {
  id: "hu07",
  hu: "HU-07",
  titulo: "Descargar el certificado de asistencia",
  async guion(e) {
    const p = e.page;
    const simposio = await idCongreso("simposio-salud-digital-2026");

    await e.portada("HU-07", "Descargar el certificado de asistencia", "Como <b>asistente</b>, quiero descargar un certificado de asistencia desde mi área personal para justificar mis horas de formación.", [
      "Solo cuando el congreso ha terminado",
      "Solo con asistencia a al menos el 80 % de las sesiones de la agenda",
      "Si no se cumple, se explica el motivo y el porcentaje alcanzado",
      "Nadie puede descargar el certificado de otra persona",
    ]);

    // ── US1-1
    await e.entrar("asistente1@congresalia.es");
    await e.escenario("US1-1", "Asistencia del 80 %: certificado disponible", "Asistente 1 asistió a 4 de las 5 sesiones de su agenda en el Simposio de Salud Digital (ya finalizado).");
    await abrir(e, "Simposio de Salud Digital 2026");
    await e.resaltar(p.getByTestId("porcentaje"), 2000);
    await e.resaltar(p.getByText(/Horas de formación/), 1600);
    for (const s of await p.getByTestId("sesion-certificado").all()) await e.resaltar(s, 700);
    const descarga = p.waitForEvent("download");
    await e.clic(p.getByRole("link", { name: "Descargar certificado" }), 600);
    const d = await descarga;
    await e.narrar(`Descargado: ${d.suggestedFilename()}. Así es el PDF:`, 1500);
    const pdf = (await (await p.request.get(`/api/certificado/${simposio}`)).body()).toString("base64");
    await p.evaluate((b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const f = document.createElement("iframe");
      f.src = `${url}#toolbar=0&view=FitH`;
      f.style.cssText = "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:2147483000;background:#525659";
      document.body.appendChild(f);
    }, pdf);
    await e.narrar("Nombre, congreso, fechas y sede, porcentaje, sesiones asistidas y horas de formación.", 3500);
    await p.mouse.move(720, 400);
    for (let i = 0; i < 4; i++) await e.desplazar(260, 1100);
    await e.pausa(1500);

    // ── US1-4
    await e.escenario("US1-4", "Congreso que aún no ha terminado", "En el Congreso de Innovación Educativa (en curso) ve su porcentaje provisional y cuándo estará disponible.");
    await e.ir("/area-personal", 600);
    await abrir(e, "Congreso de Innovación Educativa 2026");
    await e.resaltar(p.getByText("Asistencia provisional"), 1400);
    await e.resaltar(p.getByTestId("motivo"), 2400);

    // ── US1-6
    await e.entrar("organizador@congresalia.es");
    await e.escenario("US1-6", "El certificado de otra persona", "La URL de descarga no admite elegir a quién: siempre es el de quien la pide. La organizadora no tiene inscripción, así que no hay nada que descargar.");
    await pedirPdf(e, simposio, "Descarga pedida por la organizadora");

    // ── US1-2 / US1-3
    await e.entrar("asistente2@congresalia.es");
    await e.escenario("US1-2", "Asistencia insuficiente", "Asistente 2 asistió a 3 de 5 sesiones (60 %): se explica el motivo y no hay botón de descarga.");
    await abrir(e, "Simposio de Salud Digital 2026");
    await e.resaltar(p.getByTestId("porcentaje"), 1500);
    await e.resaltar(p.getByTestId("motivo"), 3000);
    await e.escenario("US1-3", "Descarga forzada por URL", "Aunque pida el PDF directamente, el servidor lo rechaza con el mismo motivo.");
    await pedirPdf(e, simposio, "Petición directa a la URL de descarga");

    // ── US1-5
    await e.entrar("asistente3@congresalia.es");
    await e.escenario("US1-5", "Agenda vacía", "Asistente 3 se inscribió en el Simposio pero no añadió ninguna sesión a su agenda.");
    await abrir(e, "Simposio de Salud Digital 2026");
    await e.resaltar(p.getByTestId("motivo"), 2600);

    // ── US1-7
    await e.entrar("asistente4@congresalia.es");
    await e.escenario("US1-7", "Sin inscripción confirmada", "Asistente 4 no pagó su inscripción: no hay congresos en «Certificado», ni aunque abra la URL directamente.");
    await e.clic(p.getByRole("link", { name: "Área personal" }), 900);
    await e.clic(p.getByRole("link", { name: /Certificado/ }), 1200);
    await e.resaltar(p.getByText("No tienes inscripciones confirmadas."), 1800);
    await e.ir("/area-personal/certificado/congreso-innovacion-educativa-2026", 1200);
    await e.resaltar(p.getByTestId("motivo"), 2600);
  },
};
