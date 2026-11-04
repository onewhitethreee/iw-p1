/**
 * Monta los vídeos grabados por grabar.ts:
 *   - demo/videos/huXX.mp4        un vídeo por historia (H.264, listo para el navegador)
 *   - demo/videos/demo-completa.mp4  todas seguidas, con capítulos incrustados
 *   - demo/videos/miniaturas/huXX.jpg
 *   - demo/datos.js               índice de historias y escenarios que usa demo/index.html
 * Uso: pnpm exec tsx demo/montar.ts   (requiere ffmpeg y ffprobe en el PATH)
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Capitulo } from "./lib/escena";
import { HISTORIAS } from "./historias";

const AQUI = dirname(fileURLToPath(import.meta.url));
const DEMO = resolve(AQUI, "../../../demo");
const VIDEOS = join(DEMO, "videos");
const CRUDO = resolve(AQUI, "grabacion"); // salida de grabar.ts (no se entrega)
const MINIS = join(VIDEOS, "miniaturas");

/** Texto de cada historia (docs/historias-usuario.md) para la página. */
const FICHAS: Record<string, { rol: string; como: string; criterios: string[]; spec?: string }> = {
  hu00: {
    rol: "Visitante y usuarios registrados",
    como: "Base común del sistema: portada pública, registro, inicio de sesión y una zona por rol.",
    criterios: ["Portada con los congresos y su fase", "Registro e inicio de sesión con mensajes de error claros", "Cada zona solo para su rol; una cuenta puede tener varios roles"],
    spec: "specs/000-core/spec.md",
  },
  hu01: {
    rol: "Ponente",
    como: "Como ponente, quiero enviar una propuesta de ponencia con un resumen y su área temática para que el comité científico la valore.",
    criterios: ["Solo con el plazo de envío abierto", "Cerrado el plazo, se rechaza y se explica", "Título, resumen y área válida del congreso", "El ponente ve sus propuestas y su estado"],
    spec: "specs/001-enviar-propuesta/spec.md",
  },
  hu02: {
    rol: "Comité científico",
    como: "Como miembro del comité científico, quiero evaluar las propuestas que tengo asignadas con una puntuación y comentarios para seleccionar las mejores ponencias.",
    criterios: ["Solo ve las propuestas asignadas", "Revisión anónima: nunca se muestra el autor", "Puntuación y comentarios", "No se acepta sin al menos dos evaluaciones"],
    spec: "specs/002-evaluar-propuestas/spec.md",
  },
  hu03: {
    rol: "Organizador",
    como: "Como organizador, quiero asignar cada ponencia aceptada a una sala y un horario y publicar el programa para que los asistentes y el público lo consulten.",
    criterios: ["Solo ponencias aceptadas", "Sin solapes de ponente", "Sin dos sesiones en la misma sala a la vez", "Programa público, renderizado en servidor y con SEO"],
    spec: "specs/003-programa-congreso/spec.md",
  },
  hu04: {
    rol: "Asistente",
    como: "Como asistente, quiero inscribirme eligiendo mi tipo de entrada y pagarla para asistir al congreso.",
    criterios: ["Tarifa según tipo de asistente y fecha (temprana / general)", "Pendiente hasta que se paga", "Confirmada, obtiene su acreditación con QR"],
    spec: "specs/004-inscripcion-pago/spec.md",
  },
  hu05: {
    rol: "Asistente inscrito",
    como: "Como asistente inscrito, quiero añadir a mi agenda las sesiones a las que quiero ir para organizar mi congreso.",
    criterios: ["Solo con inscripción confirmada", "Sin sesiones solapadas", "Sin superar el aforo", "Quitar sesiones que no han empezado"],
    spec: "specs/005-agenda-personal/spec.md",
  },
  hu06: {
    rol: "Personal de acreditación",
    como: "Como personal de acreditación, quiero escanear el QR del asistente a la entrada de la sala para controlar el aforo y registrar la asistencia real.",
    criterios: ["Sala llena: se rechaza", "QR no válido o no confirmado: se rechaza", "Cada entrada aceptada se registra como asistencia"],
    spec: "specs/006-acceso-qr/spec.md",
  },
  hu07: {
    rol: "Asistente",
    como: "Como asistente, quiero descargar un certificado de asistencia desde mi área personal para justificar mis horas de formación.",
    criterios: ["Solo al terminar el congreso", "Con asistencia a al menos el 80 % de la agenda", "Si no se cumple, se explica el motivo y el porcentaje"],
    spec: "specs/007-certificado-asistencia/spec.md",
  },
  hu08: {
    rol: "Organizador",
    como: "Como organizador, quiero un panel con inscripciones, ingresos y ocupación de cada sesión, con desglose por tipo de entrada, para tomar decisiones sobre la marcha.",
    criterios: ["Inscripciones e ingresos, totales y por tipo de entrada", "Ocupación de cada sesión respecto a su aforo", "Actualización en tiempo real", "Mover sesiones llenas a una sala más grande"],
    spec: "specs/008-panel-tiempo-real/spec.md",
  },
};

const ff = (args: string[]) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const duracion = (f: string) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

mkdirSync(MINIS, { recursive: true });
const indice = JSON.parse(readFileSync(join(CRUDO, "capitulos.json"), "utf8")) as Record<string, { titulo: string; capitulos: Capitulo[] }>;
const historias = [];
let offset = 0;
for (const h of HISTORIAS) {
  const crudo = join(CRUDO, `${h.id}.webm`);
  if (!existsSync(crudo) || !indice[h.id]) {
    console.warn(`(sin grabación de ${h.id})`);
    continue;
  }
  const mp4 = join(VIDEOS, `${h.id}.mp4`);
  console.log(`▶ ${h.id}: codificando…`);
  // CRF 26 basta para texto sobre fondos planos; faststart para empezar a reproducir sin descargarlo entero
  ff(["-i", crudo, "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "25", "-movflags", "+faststart", "-an", mp4]);
  ff(["-ss", "3", "-i", mp4, "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "4", join(MINIS, `${h.id}.jpg`)]);
  const d = duracion(mp4);
  historias.push({ id: h.id, hu: h.hu, titulo: h.titulo, video: `videos/${h.id}.mp4`, miniatura: `videos/miniaturas/${h.id}.jpg`, duracion: d, inicio: offset, ...FICHAS[h.id], capitulos: indice[h.id]!.capitulos.map((c) => ({ ...c, t: Math.min(c.t, d - 1) })) });
  offset += d;
}

// Vídeo completo: concatenación sin recodificar + capítulos (escenarios) incrustados
// Los ficheros temporales del montaje van con la grabación en bruto, no en /demo
const lista = join(CRUDO, "lista.txt");
writeFileSync(lista, historias.map((h) => `file '${join(VIDEOS, `${h.id}.mp4`).replace(/\\/g, "/")}'`).join("\n"));
const meta = [";FFMETADATA1", "title=Congresalia · Demo de las historias de usuario"];
for (const h of historias) {
  h.capitulos.forEach((c, i) => {
    const ini = h.inicio + c.t;
    const fin = i + 1 < h.capitulos.length ? h.inicio + h.capitulos[i + 1]!.t : h.inicio + h.duracion;
    meta.push("[CHAPTER]", "TIMEBASE=1/1000", `START=${Math.round(ini * 1000)}`, `END=${Math.round(fin * 1000)}`, `title=${h.hu} · ${c.escenario} · ${c.titulo}`);
  });
}
writeFileSync(join(CRUDO, "capitulos.txt"), meta.join("\n"));
console.log("▶ demo-completa.mp4");
ff(["-f", "concat", "-safe", "0", "-i", lista, "-i", join(CRUDO, "capitulos.txt"), "-map_metadata", "1", "-map_chapters", "1", "-c", "copy", "-movflags", "+faststart", join(VIDEOS, "demo-completa.mp4")]);

const datos = { generado: new Date().toISOString(), completo: { video: "videos/demo-completa.mp4", duracion: offset }, historias };
writeFileSync(join(DEMO, "datos.js"), `// Generado por apps/web/demo/montar.ts — no editar a mano\nwindow.DEMO = ${JSON.stringify(datos, null, 1)};\n`);
console.log(`✔ ${historias.length} historias, ${historias.reduce((n, h) => n + h.capitulos.length, 0)} capítulos, ${(offset / 60).toFixed(1)} min`);
