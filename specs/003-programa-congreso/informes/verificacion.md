# Verificación de spec-003 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-003` · **Datos**: seed de 000-core (recargado por `tests/e2e/global-setup.ts`)
- **Ejecutado por**: pruebas automáticas (Vitest + Playwright) y Lighthouse 12; el responsable revisa este registro

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 programar | e2e + integración programar (a) | Sesión 10:00–10:30; 10:00 Madrid = 08:00 UTC en verano | Igual | ✔ |
| 2 | US1-2 solape de ponente | e2e + integración (b) | «Pablo Ponente ya tiene la sesión «Vacunación…» de 10:00 a 10:30» | Igual | ✔ |
| 3 | US1-3 solape de sala | integración (c), mover (b2) | «La sala … está ocupada por «…» de … a …» | Igual | ✔ |
| 4 | US1-4 contiguas | e2e + integración (d) | Aceptadas | Igual | ✔ |
| 5 | US2-3 aforo | integración mover (c) | «La sala Pequeña tiene aforo 1 y la sesión tiene 2 reservas» | Igual | ✔ |
| 6 | US3-2 borrador | e2e | «El programa aún no se ha publicado.» y 0 sesiones | Igual | ✔ |
| 7 | US3-1/3 publicar + SEO | e2e (navegador y `request.get` sin JS) | Sesiones en el HTML, `<title>`, canonical, JSON-LD `Event`, sitemap, robots | Igual | ✔ |
| 8 | US2-5 / P1 sesión empezada | integración mover (e) | Horario/quitar rechazados; cambio de sala aceptado | Igual | ✔ |
| 9 | SC-002 Lighthouse | Lighthouse 12 (Chromium preinstalado) sobre `/congresos/congreso-innovacion-educativa-2026/programa` | SEO ≥ 90 | **SEO 100**, accesibilidad 100 ([lighthouse.json](lighthouse.json)) | ✔ |
| — | US1-5/6 datos y estados | integración (e)(f), incluida medianoche (P3) | Rechazos con mensaje | Igual | ✔ |
| — | FR-012 congreso finalizado | integración programar (h), mover (f) | Rechazo | Igual | ✔ |
| — | SC-001 concurrencia | integración programar (i) | 1 de 2 programaciones simultáneas | Igual | ✔ |

## SC-004 (programar en < 1 min)

El formulario por ponencia tiene 4 controles (sala, día, inicio, fin) y el e2e programa una sesión en ~1 s. La medición con una persona queda **pendiente del responsable**.

## Regresión

dominio 38/38 · integración 44/44 (000-core 22 + spec-003 22) · e2e 12/12 (000-core 7 + spec-003 5) · lint y typecheck sin errores.

## Estimación KLM (SC-004 < 1 min) · 2026-11-04

Medición con persona real **todavía pendiente**. Mientras tanto, estimación con el *Keystroke-Level Model* sobre la interfaz real ([informe](../../000-core/informes/estimacion-klm.md), script `apps/web/tests/klm/estimar-klm.ts`): 15,9 s (medio) / 23,2 s (lento) ✔.
