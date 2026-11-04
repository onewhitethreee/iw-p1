/**
 * Capa visual de la demo, inyectada en cada página grabada: rótulo del escenario, cursor visible,
 * consola de «petición directa» y miniatura de una segunda ventana. Solo se usa en la grabación.
 */
export interface EstadoOverlay {
  hu: string; // "HU-04"
  historia: string; // título corto de la historia
  escenario: string | null; // "US2-2"
  titulo: string | null;
  detalle: string | null;
  consola: { titulo: string; peticion: string; respuesta: string; ok: boolean } | null;
  pip: { titulo: string; imagen: string } | null;
  aviso: string | null; // banda superior (p. ej. «Dato preparado en BD»)
  raton?: { x: number; y: number };
}

/** Script que se ejecuta en cada documento (addInitScript). Pinta el estado que devuelve window.__demoEstado(). */
const CSS = String.raw`
  #demo-raiz { position: fixed; inset: 0; pointer-events: none; z-index: 2147483646; font-family: "Segoe UI", system-ui, sans-serif; }
  #demo-rotulo { position: absolute; left: 24px; bottom: 22px; max-width: 760px; background: rgba(15,23,42,.94); color: #f8fafc;
    border-radius: 14px; padding: 14px 18px 15px; box-shadow: 0 10px 30px rgba(0,0,0,.35); border-left: 6px solid #38bdf8;
    transition: opacity .35s, transform .35s; }
  #demo-rotulo.oculto { opacity: 0; transform: translateY(12px); }
  #demo-rotulo .linea1 { display: flex; gap: 8px; align-items: center; font-size: 13px; letter-spacing: .02em; color: #bae6fd; margin-bottom: 4px; }
  #demo-rotulo .chip { background: #0ea5e9; color: #fff; font-weight: 700; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
  #demo-rotulo .chip.esc { background: #334155; color: #e2e8f0; }
  #demo-rotulo .titulo { font-size: 21px; font-weight: 650; line-height: 1.25; }
  #demo-rotulo .detalle { font-size: 15px; color: #cbd5e1; margin-top: 4px; line-height: 1.35; }
  #demo-consola { position: absolute; right: 24px; top: 84px; width: 520px; background: #0b1020; color: #e2e8f0; border-radius: 12px;
    box-shadow: 0 12px 34px rgba(0,0,0,.45); overflow: hidden; font-family: "Cascadia Mono", Consolas, monospace; font-size: 13px; }
  #demo-consola .cab { background: #1e293b; padding: 8px 12px; font-family: "Segoe UI", system-ui, sans-serif; font-weight: 600; font-size: 14px; display:flex; gap:8px; align-items:center; }
  #demo-consola .cab::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; box-shadow: 16px 0 0 #22c55e, 32px 0 0 #ef4444; margin-right: 36px; }
  #demo-consola pre { margin: 0; padding: 10px 14px; white-space: pre-wrap; word-break: break-word; line-height: 1.4; }
  #demo-consola .pet { color: #93c5fd; border-bottom: 1px solid #1e293b; }
  #demo-consola .res.ok { color: #86efac; }
  #demo-consola .res.ko { color: #fca5a5; }
  #demo-pip { position: absolute; right: 24px; bottom: 22px; width: 470px; background: #fff; border-radius: 12px; overflow: hidden;
    box-shadow: 0 12px 34px rgba(0,0,0,.4); border: 3px solid #f59e0b; }
  #demo-pip .cab { background: #f59e0b; color: #1c1917; font-weight: 700; font-size: 13px; padding: 5px 10px; }
  #demo-pip img { display: block; width: 100%; }
  #demo-aviso { position: absolute; left: 50%; top: 14px; transform: translateX(-50%); background: #fef3c7; color: #78350f; border: 1px solid #f59e0b;
    padding: 6px 14px; border-radius: 999px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,.15); }
  #demo-cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px; z-index: 2147483647; pointer-events: none;
    transition: transform .28s cubic-bezier(.3,.7,.4,1); will-change: transform; }
  #demo-cursor svg { filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)); }
  .demo-clic { position: fixed; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; border: 3px solid #f97316;
    z-index: 2147483646; pointer-events: none; animation: demo-onda .6s ease-out forwards; }
  @keyframes demo-onda { from { transform: scale(.3); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
  .demo-resalte { outline: 3px solid #f97316 !important; outline-offset: 3px !important; border-radius: 6px; transition: outline-color .3s; }
`;

export const SCRIPT_OVERLAY = String.raw`
(() => {
  if (window.top !== window) return;
  const css = __CSS__;
  const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  let ultimo = "";
  function pintar(e) {
    if (!document.body) return;
    let raiz = document.getElementById("demo-raiz");
    if (!raiz) {
      const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
      raiz = document.createElement("div"); raiz.id = "demo-raiz"; document.body.appendChild(raiz);
    }
    const clave = JSON.stringify(e);
    if (clave === ultimo) return;
    ultimo = clave;
    if (!e) { raiz.innerHTML = ""; return; }
    let h = "";
    if (e.titulo) {
      h += '<div id="demo-rotulo"><div class="linea1"><span class="chip">' + esc(e.hu) + '</span>' + (e.escenario ? '<span class="chip esc">' + esc(e.escenario) + '</span>' : "") +
        '<span>' + esc(e.historia) + '</span></div><div class="titulo">' + esc(e.titulo) + '</div>' + (e.detalle ? '<div class="detalle">' + esc(e.detalle) + '</div>' : "") + '</div>';
    }
    if (e.consola) {
      h += '<div id="demo-consola"><div class="cab">' + esc(e.consola.titulo) + '</div><pre class="pet">' + esc(e.consola.peticion) + '</pre><pre class="res ' + (e.consola.ok ? "ok" : "ko") + '">' + esc(e.consola.respuesta) + '</pre></div>';
    }
    if (e.pip) h += '<div id="demo-pip"><div class="cab">' + esc(e.pip.titulo) + '</div><img src="' + e.pip.imagen + '"></div>';
    if (e.aviso) h += '<div id="demo-aviso">' + esc(e.aviso) + '</div>';
    raiz.innerHTML = h;
  }
  window.__demoPintar = pintar;

  // Cursor visible: sigue los eventos reales del ratón que genera Playwright
  let cursor;
  function ponerCursor() {
    if (cursor || !document.body) return;
    cursor = document.createElement("div"); cursor.id = "demo-cursor";
    cursor.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l15 11.2-6.6.9 3.9 7.4-2.9 1.5-3.9-7.5L4 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const p = window.__demoRaton || { x: 640, y: 400 };
    cursor.style.transform = "translate(" + p.x + "px," + p.y + "px)";
    document.body.appendChild(cursor);
  }
  document.addEventListener("mousemove", (ev) => {
    ponerCursor();
    window.__demoRaton = { x: ev.clientX, y: ev.clientY };
    if (cursor) cursor.style.transform = "translate(" + ev.clientX + "px," + ev.clientY + "px)";
  }, true);
  document.addEventListener("mousedown", (ev) => {
    const o = document.createElement("div"); o.className = "demo-clic"; o.style.left = ev.clientX + "px"; o.style.top = ev.clientY + "px";
    document.body.appendChild(o); setTimeout(() => o.remove(), 700);
  }, true);

  async function inicial() {
    let e = null;
    try { if (window.__demoEstado) e = await window.__demoEstado(); } catch {}
    if (e && e.raton) window.__demoRaton = e.raton;
    ponerCursor();
    pintar(e);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inicial); else inicial();
})();
`.replace("__CSS__", JSON.stringify(CSS));
