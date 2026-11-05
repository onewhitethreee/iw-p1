# Verificación de spec-001 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-001` · **Código**: commit `d2cda0e` + cambios de implement (ver commit siguiente)
- **Datos**: seed de 000-core (`pnpm db:seed`), congreso `jornadas-pediatria-2027` con llamada abierta
- **Ejecutado por**: pruebas automáticas (Vitest + Playwright); el responsable revisa este registro

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 envío válido | e2e «US1-1» | «Propuesta enviada» y fila «Enviada» | Igual | ✔ |
| 2 | US1-4 resumen corto | e2e «US1-4» + integración (d) | Error en el campo, no se guarda | «El resumen debe tener entre 100 y 3000 caracteres»; 0 filas | ✔ |
| 3 | US1-6 permisos | e2e «US1-6» + integración (f) | Asistente: acceso denegado; anónimo: a /entrar | Igual; API: FORBIDDEN / UNAUTHORIZED | ✔ |
| 4 | US1-2 plazo cerrado | integración (b), `ahora` = 00:00 del 16/02/2027 (Madrid) | CONFLICT «…está cerrado» | Igual, 0 filas nuevas | ✔ |
| 5 | FR-005a último día | integración (b), `ahora` = 23:59 del 15/02/2027 | Aceptada | Aceptada | ✔ |
| 6 | US2-1/2 lista propia | e2e «US2-1/US2-2» + integración (a)(b) | Solo propias, más reciente primero | Igual | ✔ |
| 7 | US2-5 lista vacía | e2e «US2-5» | «Todavía no has enviado ninguna propuesta.» | Igual | ✔ |
| 8 | US2-3 privacidad | integración mias (c) | Sin puntuaciones, comentarios ni evaluadores | Claves exactas `area, congreso, enviadaEn, estado, id, resumen, titulo` | ✔ |
| — | US1-3 antes de apertura | integración (c) | «…se abre el 10 de enero de 2027» | Igual | ✔ |
| — | US1-5 área de otro congreso | integración (e) | BAD_REQUEST | Igual | ✔ |
| — | FR-008/P1 inmutable | integración (i) | Solo `enviar` y `mias` | Igual | ✔ |
| — | FR-009/P2 sin límite | integración (h) | 4 propuestas aceptadas | 4 | ✔ |

## SC-001 (formulario completo en menos de 3 minutos)

El formulario tiene 4 campos y el recorrido e2e completo (entrar, abrir formulario, rellenar y enviar) tarda unos 2,4 s.
La medición con una persona real queda **pendiente de realizar por el responsable** durante la grabación de la demo;
el diseño (selectores con valores del congreso, contador de caracteres, errores por campo) no introduce pasos adicionales.

## Regresión

dominio 34/34 · integración 36/36 (000-core 22 + spec-001 14) · e2e 12/12 (000-core 7 + spec-001 5) · lint y typecheck sin errores.

## Estimación KLM (SC-001 < 3 min) · 2026-11-04

Medición con persona real **todavía pendiente**. Mientras tanto, estimación con el *Keystroke-Level Model* sobre la interfaz real ([informe](../../000-core/informes/estimacion-klm.md), script `apps/web/tests/klm/estimar-klm.ts`): resumen **pegado** 28,4 s (medio) / 55,1 s (lento) ✔; resumen **tecleado** 70,4 s (medio) ✔ / **235,1 s (lento) ✘**. El riesgo está en mecanografiar el resumen, no en la interfaz (~25 s). La medición real debe anotar si el resumen se pegó o se tecleó.

## Iteración tras clarify-2 (T016–T017, FR-011) · 2026-11-05

Rama `spec-001-clarify-2`. Las pruebas se escribieron **antes** del cambio y se ejecutaron sobre el código anterior.

| # | Escenario | Entrada | Esperado | Observado **antes** (sin índice) | Observado **después** | Resultado |
|---|-----------|---------|----------|----------------------------------|-----------------------|-----------|
| 9 | US1-7 / (k) mismo título | 2 × «Atención temprana en pediatría», mismo autor y congreso | 2.º → `CONFLICT` «Ya has enviado una propuesta con este título a este congreso»; 1 guardada | ✘ se aceptaban las dos (2 guardadas) | Igual que lo esperado | ✔ |
| 10 | (l) mayúsculas, tildes y espacios | «  ATENCIÓN TEMPRANA EN PEDIATRÍA  » tras la anterior | Rechazo; 1 guardada | ✘ aceptada | Igual que lo esperado | ✔ |
| 11 | (m) doble clic simultáneo | 2 envíos con `Promise.all` | 1 aceptado y 1 `CONFLICT`; 1 guardada | ✘ 2 aceptados | Igual que lo esperado | ✔ |
| 12 | (n) otro congreso / otro autor | mismo título | Se aceptan (3 guardadas) | ✔ (ya funcionaba; prueba de no regresión) | ✔ | ✔ |
| 13 | US1-7 interfaz (T017) | `ponente1`: título T y luego «  t  » en minúsculas | Alerta con el mensaje, sigue en `/ponente/enviar`, una sola fila | — (prueba nueva) | Igual que lo esperado | ✔ |

Comando del «antes»: `pnpm exec vitest run tests/integration/001/enviar.test.ts` → **3 failed | 11 passed** ((k), (l), (m) en rojo). Después: **14/14**.

**Regresión** (enunciado §5.4): dominio 42/42 · integración **170/170** (166 + 4) · e2e **47/47** (46 + 1, `E2E_PORT=3300`) · lint y typecheck sin errores · `next build` correcto. `prisma migrate diff` desde la BD hacia `schema.prisma` da una migración vacía: Prisma no intentará borrar el índice.

## Medición con personas de SC-001 (T015) · 2026-11-05

Mediciones del responsable con 3 personas (A, B, C) que no conocían la aplicación, cronometradas con la aplicación en local y el seed recargado antes de cada persona. Inicio: el formulario «Enviar propuesta» abierto (`ponente1@`). Fin: «Propuesta enviada.».

| Persona | Resumen | Tiempo | Válida para SC-001 (clarify-3 P5) | Resultado |
|---------|---------|--------|-----------------------------------|-----------|
| A | pegado | 1 min 35 s | sí | ✔ |
| B | tecleado | 2 min 48 s | no (referencia) | — |
| C | tecleado | 3 min 22 s | no (referencia) | — |

**Estado**: 1/1 medición válida bajo 3 min; faltan 2 con el resumen pegado para cerrar T015. Las mediciones tecleando confirman lo que anticipaba la estimación KLM (perfil lento > 180 s).

### Segunda medición de SC-001 con el resumen pegado (clarify-3 P5) · 2026-11-05

| Medición válida | Resumen | Tiempo | < 3 min |
|-----------------|---------|--------|---------|
| 1 (persona A) | pegado | 1 min 35 s | ✔ |
| 2 | pegado | 2 min 23 s | ✔ |

**Estado**: 2/2 mediciones válidas bajo 3 min. Para tener 3 personas como en el resto de criterios falta **1 medición más** pegando el resumen (issue #1).
