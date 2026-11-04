/**
 * Estimación KLM (Keystroke-Level Model; Card, Moran y Newell, 1983) de los 4 criterios de tiempo
 * con usuario real que siguen pendientes: spec-001 SC-001, spec-002 SC-003, spec-003 SC-004 y spec-004 SC-001.
 *
 * Playwright ejecuta cada flujo en la interfaz real (tecleando carácter a carácter) y registra los operadores
 * que haría una persona; R (espera del sistema) se MIDE. Es una ESTIMACIÓN, no una medición con personas.
 *
 * Uso (con el seed recién cargado y `next start -p 3100` en marcha):
 *   pnpm db:seed && pnpm --filter web exec tsx tests/klm/estimar-klm.ts
 */
import { chromium, expect, type Locator, type Page } from "@playwright/test";

const BASE = process.env.KLM_URL ?? "http://localhost:3100";

/** Valores de operador (s). K: mecanógrafo medio (40 ppm) y «peor mecanógrafo» de la tabla original. */
const PERFILES = {
  medio: { K: 0.28, P: 1.1, B: 0.1, H: 0.4, M: 1.35 },
  lento: { K: 1.2, P: 1.1, B: 0.1, H: 0.4, M: 1.35 },
} as const;
/** Lectura del resumen a evaluar: 200 palabras/min (por debajo de la media de ~238 de Brysbaert, 2019). */
const PALABRAS_POR_MIN = 200;

type Op = "K" | "P" | "B" | "H" | "M";

class Registro {
  cuenta: Record<Op, number> = { K: 0, P: 0, B: 0, H: 0, M: 0 };
  R = 0; // espera del sistema medida (s)
  lectura = 0; // s
  pasos: string[] = [];
  private enTeclado = false;

  constructor(private page: Page) {}

  private op(o: Op, n = 1) {
    this.cuenta[o] += n;
  }
  private alRaton() {
    if (!this.enTeclado) return;
    this.op("H");
    this.enTeclado = false;
  }
  private alTeclado() {
    if (this.enTeclado) return;
    this.op("H");
    this.enTeclado = true;
  }

  /** M + apuntar + clic. Si `espera` se da, mide R hasta que se cumple. */
  async clic(loc: Locator, nota: string, espera?: () => Promise<void>) {
    this.alRaton();
    this.op("M");
    this.op("P");
    this.op("B", 2);
    const t = performance.now();
    await loc.click();
    if (espera) await espera();
    this.R += (performance.now() - t) / 1000;
    this.pasos.push(`clic · ${nota}`);
  }

  /** M + desplegar (P, BB) + elegir opción (P, BB). */
  async elegir(loc: Locator, texto: string, nota: string) {
    this.alRaton();
    this.op("M");
    this.op("P", 2);
    this.op("B", 4);
    const valor = await loc.locator("option", { hasText: texto }).first().getAttribute("value");
    await loc.selectOption(valor!);
    this.pasos.push(`elegir · ${nota} = «${texto}»`);
  }

  /** M + apuntar al campo + clic + teclear `texto` carácter a carácter. */
  async teclear(loc: Locator, texto: string, nota: string) {
    this.alRaton();
    this.op("M");
    this.op("P");
    this.op("B", 2);
    await loc.click();
    this.alTeclado();
    this.op("K", texto.length);
    await loc.fill("");
    await loc.pressSequentially(texto);
    this.pasos.push(`teclear · ${nota} (${texto.length} car.)`);
  }

  /** `<input type="time">`: la persona teclea 4 dígitos (Chrome pone los «:»); Playwright rellena el valor. */
  async hora(loc: Locator, hhmm: string, nota: string) {
    this.alRaton();
    this.op("M");
    this.op("P");
    this.op("B", 2);
    await loc.click();
    this.alTeclado();
    this.op("K", 4);
    await loc.fill(hhmm);
    this.pasos.push(`teclear · ${nota} (4 dígitos, ${hhmm})`);
  }

  /** Como `teclear`, pero pegando el texto ya preparado (Ctrl+V = 2 K). */
  async pegar(loc: Locator, texto: string, nota: string) {
    this.alRaton();
    this.op("M");
    this.op("P");
    this.op("B", 2);
    await loc.click();
    this.alTeclado();
    this.op("K", 2);
    await loc.fill(texto);
    this.pasos.push(`pegar · ${nota} (${texto.length} car.)`);
  }

  async leer(loc: Locator, nota: string) {
    const palabras = (await loc.innerText()).split(/\s+/).filter(Boolean).length;
    this.lectura += (palabras / PALABRAS_POR_MIN) * 60;
    this.pasos.push(`leer · ${nota} (${palabras} palabras)`);
  }

  total(perfil: keyof typeof PERFILES) {
    const v = PERFILES[perfil];
    const ops = (Object.keys(this.cuenta) as Op[]).reduce((s, o) => s + this.cuenta[o] * v[o], 0);
    return ops + this.R + this.lectura;
  }
}

async function entrar(page: Page, email: string) {
  await page.context().clearCookies();
  await page.goto(`${BASE}/entrar`);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("congreso123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar/);
}

const RESUMEN =
  "Presentamos los resultados de un programa de cribado auditivo neonatal en tres hospitales, con la metodología, los indicadores y las mejoras propuestas.";

type Flujo = {
  id: string;
  criterio: string;
  limite: number;
  usuario: string;
  inicio: string;
  hasta: string;
  pasos: (page: Page, r: Registro) => Promise<void>;
};

/** HU-01: el resumen se teclea entero o se pega ya preparado (variante habitual en una llamada a comunicaciones). */
const enviarPropuesta = (pegarResumen: boolean) => async (page: Page, r: Registro) => {
  await r.clic(page.getByRole("link", { name: "Enviar propuesta" }), "Enviar propuesta", () =>
    expect(page.getByLabel("Congreso")).toBeVisible(),
  );
  await r.elegir(page.getByLabel("Congreso"), "Jornadas de Pediatría 2027", "Congreso");
  await r.elegir(page.getByLabel("Área temática"), "Neonatología", "Área temática");
  await r.teclear(page.getByLabel("Título"), `Cribado auditivo neonatal ${pegarResumen ? "B" : "A"}`, "Título");
  if (pegarResumen) await r.pegar(page.getByLabel("Resumen"), RESUMEN, "Resumen");
  else await r.teclear(page.getByLabel("Resumen"), RESUMEN, "Resumen");
  await r.clic(page.getByRole("button", { name: "Enviar propuesta" }), "Enviar", () =>
    expect(page.getByText("Propuesta enviada.")).toBeVisible(),
  );
};

const FLUJOS: Flujo[] = [
  {
    id: "spec-001 T015 (a)",
    criterio: "SC-001 · enviar una propuesta, resumen tecleado",
    limite: 180,
    usuario: "ponente1@congresalia.es",
    inicio: "/ponente",
    hasta: "mensaje «Propuesta enviada.»",
    pasos: enviarPropuesta(false),
  },
  {
    id: "spec-001 T015 (b)",
    criterio: "SC-001 · enviar una propuesta, resumen pegado",
    limite: 180,
    usuario: "ponente1@congresalia.es",
    inicio: "/ponente",
    hasta: "mensaje «Propuesta enviada.»",
    pasos: enviarPropuesta(true),
  },
  {
    id: "spec-002 T020",
    criterio: "SC-003 · evaluar una propuesta asignada",
    limite: 120,
    usuario: "comite1@congresalia.es",
    inicio: "/comite",
    hasta: "mensaje «Evaluación guardada.»",
    pasos: async (page, r) => {
      const fila = page.getByTestId("fila-asignacion").filter({ hasText: "Uso racional de antibióticos" });
      await r.clic(fila.getByRole("link", { name: "Evaluar" }), "Evaluar", () => expect(page.getByTestId("titulo-propuesta")).toBeVisible());
      await r.leer(page.getByRole("main"), "propuesta completa (título, área, resumen y etiquetas del formulario)");
      await r.elegir(page.getByLabel(/Puntuación/), "8", "Puntuación");
      await r.teclear(page.getByLabel("Comentarios"), "Buen planteamiento clínico, conviene detallar la muestra.", "Comentarios");
      await r.clic(page.getByRole("button", { name: "Guardar evaluación" }), "Guardar", () =>
        expect(page.getByText("Evaluación guardada.")).toBeVisible(),
      );
    },
  },
  {
    id: "spec-003 T022",
    criterio: "SC-004 · programar una ponencia aceptada",
    limite: 60,
    usuario: "organizador@congresalia.es",
    inicio: "/organizador/jornadas-pediatria-2027/programa",
    hasta: "la sesión aparece en el programa",
    pasos: async (page, r) => {
      const p = page.getByTestId("pendiente").filter({ hasText: "Vacunación en la adolescencia" });
      await r.elegir(p.getByLabel("Sala"), "Auditorio", "Sala");
      await r.hora(p.getByLabel("Hora de inicio"), "10:00", "Hora de inicio");
      await r.hora(p.getByLabel("Hora de fin"), "10:30", "Hora de fin");
      await r.clic(p.getByRole("button", { name: "Programar" }), "Programar", () =>
        expect(page.getByTestId("sesion-org").filter({ hasText: "Vacunación en la adolescencia" })).toContainText("10:00–10:30"),
      );
    },
  },
  {
    id: "spec-004 T013",
    criterio: "SC-001 · inscribirse y pagar",
    limite: 180,
    usuario: "asistente5@congresalia.es",
    inicio: "/congresos/jornadas-pediatria-2027",
    hasta: "inscripción «Confirmada» con QR",
    pasos: async (page, r) => {
      await r.clic(page.getByRole("link", { name: "Inscribirme" }).first(), "Inscribirme (ficha)", () =>
        expect(page.getByLabel("Tipo de asistente")).toBeVisible(),
      );
      await r.elegir(page.getByLabel("Tipo de asistente"), "Estudiante", "Tipo de asistente");
      await r.clic(page.getByRole("button", { name: "Inscribirme" }), "Inscribirme", () =>
        expect(page.getByLabel("Número de tarjeta")).toBeVisible(),
      );
      await r.teclear(page.getByLabel("Número de tarjeta"), "4111111111111111", "Número de tarjeta");
      await r.clic(page.getByRole("button", { name: /^Pagar/ }), "Pagar", async () => {
        const t = page.getByTestId("inscripcion").filter({ hasText: "Jornadas de Pediatría" });
        await expect(t).toContainText("Confirmada");
        await expect(t.getByRole("img", { name: "Código QR de acreditación" })).toBeVisible();
      });
    },
  },
];

const s = (x: number) => x.toFixed(1).replace(".", ",");

async function main() {
  const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await navegador.newPage({ locale: "es-ES", timezoneId: "Europe/Madrid" });
  const filas: string[] = [];
  for (const f of FLUJOS) {
    await entrar(page, f.usuario);
    await page.goto(`${BASE}${f.inicio}`);
    const r = new Registro(page);
    await f.pasos(page, r);
    const medio = r.total("medio");
    const lento = r.total("lento");
    const c = r.cuenta;
    console.log(`\n## ${f.id} · ${f.criterio} (límite ${f.limite} s)\n${r.pasos.map((p) => `- ${p}`).join("\n")}`);
    console.log(`Operadores: K=${c.K} P=${c.P} B=${c.B} H=${c.H} M=${c.M} · R medido=${s(r.R)} s · lectura=${s(r.lectura)} s`);
    console.log(`Estimación: medio=${s(medio)} s · lento=${s(lento)} s → ${lento < f.limite ? "CUMPLE" : "NO CUMPLE"} incluso con el perfil lento`);
    filas.push(
      `| ${f.id} | ${f.criterio} | ${c.K} | ${c.P} | ${c.B} | ${c.H} | ${c.M} | ${s(r.R)} | ${s(r.lectura)} | ${s(medio)} | ${s(lento)} | < ${f.limite} | ${lento < f.limite ? "✔" : "✘"} |`,
    );
  }
  await navegador.close();
  console.log("\n| Tarea | Criterio | K | P | B | H | M | R medido (s) | Lectura (s) | Medio (s) | Lento (s) | Límite (s) | Cumple |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  console.log(filas.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
