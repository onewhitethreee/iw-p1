/**
 * Graba la demo de las historias de usuario.
 *   pnpm exec tsx demo/grabar.ts            → todas
 *   pnpm exec tsx demo/grabar.ts hu03 hu05  → solo esas
 * Requiere la app arrancada (DEMO_URL, por defecto http://localhost:3200) y la BD de desarrollo.
 * Cada historia parte de un seed limpio, así cada vídeo es independiente.
 */
import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Escena, RAPIDO, type Capitulo } from "./lib/escena";
import { HISTORIAS } from "./historias";

const AQUI = dirname(fileURLToPath(import.meta.url));
const WEB = resolve(AQUI, "..");
/** Grabaciones en bruto (.webm, ~140 MB): fuera de /demo para no inflar la entrega. */
export const SALIDA = resolve(WEB, "demo/grabacion");
const BASE = process.env.DEMO_URL ?? "http://localhost:3200";
const ANCHO = 1440;
/** Chromium completo ya instalado (soporta cámara simulada y visor de PDF); se puede cambiar con CHROMIUM_PATH. */
const CHROMIUM = process.env.CHROMIUM_PATH ?? join(process.env.LOCALAPPDATA ?? "", "ms-playwright/chromium-1228/chrome-win64/chrome.exe");
const ALTO = 810;

async function main() {
  mkdirSync(SALIDA, { recursive: true });
  const elegidas = process.argv.slice(2);
  const lista = HISTORIAS.filter((h) => elegidas.length === 0 || elegidas.includes(h.id));
  const indice = join(SALIDA, "capitulos.json");
  const capitulos: Record<string, { titulo: string; capitulos: Capitulo[] }> = existsSync(indice) ? JSON.parse(readFileSync(indice, "utf8")) : {};

  for (const h of lista) {
    console.log(`\n▶ ${h.id} · ${h.titulo}`);
    execSync("pnpm db:seed", { cwd: WEB, stdio: "pipe" });
    const extra = h.preparar ? await h.preparar() : {};
    const browser = await chromium.launch({
      headless: process.env.DEMO_VER !== "1",
      executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined,
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", ...(extra.args ?? [])],
    });
    const opciones = { baseURL: BASE, locale: "es-ES", timezoneId: "Europe/Madrid", viewport: { width: ANCHO, height: ALTO }, colorScheme: "light" as const };
    const ctx = await browser.newContext({ ...opciones, recordVideo: { dir: SALIDA, size: { width: ANCHO, height: ALTO } }, permissions: ["camera"] });
    const e = await Escena.crear(ctx, h.hu, h.titulo);
    const inicio = Date.now();
    try {
      await h.guion(e, { nuevaVentana: async () => (await browser.newContext(opciones)).newPage() });
    } catch (err) {
      await e.page.screenshot({ path: join(SALIDA, `${h.id}-error.png`) }).catch(() => undefined);
      console.error(`✖ ${h.id} falló en t=${e.segundos.toFixed(1)} s (último escenario: ${e.capitulos.at(-1)?.escenario})`);
      throw err;
    } finally {
      await e.pausa(1500);
      const video = e.page.video();
      await ctx.close();
      if (video) renameSync(await video.path(), join(SALIDA, `${h.id}.webm`));
      await browser.close();
    }
    capitulos[h.id] = { titulo: h.titulo, capitulos: e.capitulos };
    writeFileSync(indice, JSON.stringify(capitulos, null, 2));
    console.log(`✔ ${h.id}: ${e.capitulos.length} capítulos, ${((Date.now() - inicio) / 1000).toFixed(0)} s${RAPIDO ? " (modo rápido)" : ""}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
