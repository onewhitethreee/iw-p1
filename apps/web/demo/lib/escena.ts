import type { BrowserContext, Locator, Page } from "@playwright/test";
import { SCRIPT_OVERLAY, type EstadoOverlay } from "./overlay";

/** DEMO_RAPIDO=1 acorta pausas y escritura para ensayar el guion sin esperar. */
export const RAPIDO = process.env.DEMO_RAPIDO === "1";
const ESCALA = RAPIDO ? 0.08 : 1;
const RETARDO_TECLA = RAPIDO ? 0 : 38;

export const CLAVE = "congreso123";

export interface Capitulo {
  t: number; // segundos desde el inicio del vídeo de la historia
  escenario: string;
  titulo: string;
}

/**
 * Una historia grabada: una página con la capa de rótulos y utilidades para actuar «a ritmo humano».
 * Todas las acciones visibles pasan por aquí para que el vídeo se pueda seguir.
 */
export class Escena {
  readonly capitulos: Capitulo[] = [];
  private estado: EstadoOverlay;
  private t0 = Date.now();
  private raton = { x: 720, y: 420 };

  constructor(
    readonly page: Page,
    readonly ctx: BrowserContext,
    hu: string,
    historia: string,
  ) {
    this.estado = { hu, historia, escenario: null, titulo: null, detalle: null, consola: null, pip: null, aviso: null };
  }

  static async crear(ctx: BrowserContext, hu: string, historia: string) {
    await ctx.addInitScript(SCRIPT_OVERLAY);
    const page = await ctx.newPage();
    const e = new Escena(page, ctx, hu, historia);
    e.t0 = Date.now(); // el vídeo empieza al crear la página
    await page.exposeFunction("__demoEstado", () => ({ ...e.estado, raton: e.raton }));
    page.on("dialog", (d) => void d.accept()); // «¿Quitar esta sesión?» → aceptar
    return e;
  }

  get segundos() {
    return (Date.now() - this.t0) / 1000;
  }

  async pausa(ms: number) {
    await this.page.waitForTimeout(Math.round(ms * ESCALA));
  }

  private async pintar() {
    await this.page.evaluate((e) => (window as unknown as { __demoPintar?: (x: unknown) => void }).__demoPintar?.(e), { ...this.estado, raton: this.raton }).catch(() => undefined);
  }

  /** Nuevo escenario: rótulo + marca de capítulo. */
  async escenario(id: string, titulo: string, detalle?: string) {
    this.capitulos.push({ t: Math.max(0, this.segundos - 0.3), escenario: id, titulo });
    Object.assign(this.estado, { escenario: id, titulo, detalle: detalle ?? null, consola: null, pip: null, aviso: null });
    await this.pintar();
    await this.pausa(2600);
  }

  /** Cambia solo la línea de detalle del rótulo (narración dentro del escenario). */
  async narrar(detalle: string, ms = 2200) {
    this.estado.detalle = detalle;
    await this.pintar();
    await this.pausa(ms);
  }

  async aviso(texto: string | null) {
    this.estado.aviso = texto;
    await this.pintar();
  }

  async ocultarConsola() {
    this.estado.consola = null;
    this.estado.pip = null;
    await this.pintar();
  }

  /** Tarjeta de portada de la historia (pantalla completa). */
  async portada(hu: string, titulo: string, comoQuiero: string, puntos: string[]) {
    this.capitulos.push({ t: 0, escenario: "Portada", titulo });
    await this.page.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
      body{margin:0;height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#0f172a,#1e3a5f 60%,#0e7490);font-family:"Segoe UI",system-ui,sans-serif;color:#f8fafc}
      .c{max-width:1050px;padding:40px}
      .hu{display:inline-block;background:#0ea5e9;padding:6px 16px;border-radius:999px;font-weight:700;letter-spacing:.06em;font-size:20px}
      h1{font-size:54px;margin:22px 0 14px;line-height:1.1}
      .como{font-size:23px;color:#cbd5e1;line-height:1.45;margin-bottom:28px}
      ul{margin:0;padding:0;list-style:none;display:grid;gap:10px}
      li{font-size:19px;color:#e2e8f0;padding-left:30px;position:relative}
      li::before{content:"";position:absolute;left:4px;top:9px;width:12px;height:12px;border-radius:3px;background:#38bdf8}
      .marca{position:fixed;bottom:26px;right:34px;color:#94a3b8;font-size:16px}
    </style></head><body><div class="c"><span class="hu">${hu}</span><h1>${titulo}</h1><div class="como">${comoQuiero}</div>
      <ul>${puntos.map((p) => `<li>${p}</li>`).join("")}</ul></div><div class="marca">Congresalia · SI-19 Gestión de Eventos y Congresos</div></body></html>`);
    await this.pausa(6500);
  }

  // ───────────── acciones visibles ─────────────

  private async moverA(l: Locator) {
    await l.scrollIntoViewIfNeeded();
    const caja = await l.boundingBox();
    if (!caja) return;
    const x = Math.round(caja.x + Math.min(caja.width / 2, 60));
    const y = Math.round(caja.y + caja.height / 2);
    await this.page.mouse.move(x, y, { steps: RAPIDO ? 1 : 12 });
    this.raton = { x, y };
    await this.pausa(380);
  }

  async ir(url: string, ms = 1200) {
    await this.page.goto(url);
    await this.pintar();
    await this.pausa(ms);
  }

  async clic(l: Locator, ms = 900) {
    await l.waitFor({ state: "visible" });
    await this.moverA(l);
    await l.click();
    await this.pausa(ms);
  }

  async escribir(l: Locator, texto: string, ms = 350) {
    await this.moverA(l);
    await l.click();
    await l.fill("");
    await l.pressSequentially(texto, { delay: RETARDO_TECLA });
    await this.pausa(ms);
  }

  /** Campos de fecha u hora: sin clic (abriría el selector nativo), valor directo. */
  async rellenar(l: Locator, valor: string, ms = 350) {
    await this.moverA(l);
    await l.fill(valor);
    await this.pausa(ms);
  }

  /** Para textos largos: escribe el principio a mano y pega el resto. */
  async escribirLargo(l: Locator, texto: string) {
    await this.escribir(l, texto.slice(0, 40), 0);
    await l.fill(texto);
    await this.pausa(500);
  }

  async elegir(select: Locator, opcion: string | { label: string } | { contiene: string }, ms = 700) {
    await this.moverA(select);
    await select.click().catch(() => undefined);
    await this.pausa(250);
    if (typeof opcion === "object" && "contiene" in opcion) {
      const valor = await select.locator("option", { hasText: opcion.contiene }).first().getAttribute("value");
      await select.selectOption(valor!);
    } else {
      await select.selectOption(opcion);
    }
    await this.page.keyboard.press("Escape").catch(() => undefined);
    await this.pausa(ms);
  }

  /** Resalta un elemento para que el espectador vea el resultado. */
  async resaltar(l: Locator, ms = 2200) {
    await l.first().waitFor({ state: "visible" });
    await l.first().scrollIntoViewIfNeeded();
    await this.moverA(l.first());
    if (process.env.DEMO_LOG === "1") {
      const texto = (await l.first().innerText().catch(() => "")).replace(/\s+/g, " ").slice(0, 150);
      console.log(`      · ${this.capitulos.at(-1)?.escenario}: ${texto}`);
    }
    await l.first().evaluate((el) => el.classList.add("demo-resalte"));
    await this.pausa(ms);
    await l.first().evaluate((el) => el.classList.remove("demo-resalte")).catch(() => undefined);
  }

  async desplazar(dy: number, ms = 900) {
    await this.page.mouse.wheel(0, dy);
    await this.pausa(ms);
  }

  async arriba() {
    await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await this.pausa(500);
  }

  /** Inicia sesión a la vista, partiendo de una sesión limpia. */
  async entrar(email: string, desde?: string) {
    await this.ctx.clearCookies();
    await this.ir(desde ? `/entrar?desde=${encodeURIComponent(desde)}` : "/entrar", 500);
    await this.escribir(this.page.getByLabel("Correo electrónico"), email, 150);
    await this.escribir(this.page.getByLabel("Contraseña"), CLAVE, 200);
    await this.clic(this.page.getByRole("button", { name: "Entrar" }), 300);
    await this.page.waitForURL((u) => !u.pathname.startsWith("/entrar"));
    await this.page.getByTestId("usuario-actual").waitFor();
    await this.pintar();
    await this.pausa(1000);
  }

  async salir() {
    await this.ctx.clearCookies();
  }

  // ───────────── peticiones directas al servidor ─────────────

  /**
   * Llama a un procedimiento tRPC desde la propia página (con la sesión del usuario actual), como haría
   * alguien que se salta la interfaz, y muestra la petición y la respuesta en una consola sobre el vídeo.
   */
  async peticion(proc: string, input: unknown, tipo: "query" | "mutation" = "mutation", ms = 5200) {
    const r = await this.page.evaluate(
      async ({ proc, input, tipo }) => {
        const url = tipo === "query" ? `/api/trpc/${proc}?input=${encodeURIComponent(JSON.stringify({ json: input }))}` : `/api/trpc/${proc}`;
        const res = await fetch(url, tipo === "query" ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ json: input }) });
        return { status: res.status, cuerpo: await res.text() };
      },
      { proc, input, tipo },
    );
    let respuesta: string;
    let ok = r.status < 400;
    let datos: unknown = null;
    try {
      const j = JSON.parse(r.cuerpo) as { error?: { json?: { message?: string; data?: { code?: string } } }; result?: { data?: { json?: unknown } } };
      if (j.error) {
        respuesta = `← ${r.status} ${j.error.json?.data?.code ?? ""}\n«${j.error.json?.message ?? ""}»`;
        ok = false;
      } else {
        datos = j.result?.data?.json;
        respuesta = `← ${r.status} OK\n${JSON.stringify(datos, null, 1).slice(0, 700)}`;
      }
    } catch {
      respuesta = `← ${r.status}\n${r.cuerpo.slice(0, 400)}`;
    }
    console.log(`   [${this.capitulos.at(-1)?.escenario}] ${proc} → ${respuesta.replace(/\n/g, " ").slice(0, 160)}`);
    const peticion = `${tipo === "query" ? "GET" : "POST"} /api/trpc/${proc}\n${JSON.stringify(input, null, 1)}`;
    this.estado.consola = { titulo: "Petición directa al servidor (sin pasar por la interfaz)", peticion, respuesta, ok };
    await this.pintar();
    await this.pausa(ms);
    return { status: r.status, ok, datos, cuerpo: r.cuerpo };
  }

  /** Muestra una petición HTTP cualquiera (p. ej. la descarga del certificado). */
  async consola(titulo: string, peticion: string, respuesta: string, ok: boolean, ms = 5000) {
    this.estado.consola = { titulo, peticion, respuesta, ok };
    await this.pintar();
    await this.pausa(ms);
  }

  /** Miniatura de otra ventana (otro usuario actuando a la vez). */
  async pip(titulo: string, otra: Page, ms = 1500) {
    const buf = await otra.screenshot({ type: "jpeg", quality: 70 });
    this.estado.pip = { titulo, imagen: `data:image/jpeg;base64,${buf.toString("base64")}` };
    await this.pintar();
    await this.pausa(ms);
  }
}
