# Quickstart: validar spec-001

Requisitos: base de 000-core en marcha (`pnpm db:migrate && pnpm db:seed && pnpm dev`). Congreso con llamada abierta: `jornadas-pediatria-2027`.

| # | Escenario (spec) | Pasos | Resultado esperado |
|---|------------------|-------|--------------------|
| 1 | US1-1 habitual | Entrar como `ponente1@congresalia.es` → «Mis propuestas» → «Enviar propuesta» → congreso Jornadas de Pediatría, área, título y resumen ≥ 100 caracteres → Enviar | Confirmación «Propuesta enviada» y aparece la primera en la lista con estado «Enviada» |
| 2 | US1-4 datos | Resumen de 20 caracteres | Error en el campo resumen; no se guarda |
| 3 | US1-6 permisos | Entrar como `asistente1@` → `/ponente/enviar` | «Acceso denegado» |
| 4 | US1-2 plazo cerrado | Prueba de integración con `ahora` = 00:00 del día siguiente al cierre | `CONFLICT` «…está cerrado» |
| 5 | FR-005a último día | Prueba con `ahora` = 23:59 del día de cierre | Se acepta |
| 6 | US2-1/2 | `ponente1` ve sus propuestas (4 estados) y ninguna de `ponente2` | Lista solo propia, más reciente primero |
| 7 | US2-5 vacío | Registrar un ponente nuevo → «Mis propuestas» | «Todavía no has enviado ninguna propuesta» |
| 8 | US2-3 privacidad | Respuesta de `propuesta.mias` | Sin puntuaciones, comentarios ni evaluadores |
| 9 | US1-7 título repetido (clarify-2 P4) | Como `ponente1`, enviar dos veces al mismo congreso una propuesta con el mismo título (la segunda en minúsculas y con espacios) | La segunda se rechaza: «Ya has enviado una propuesta con este título a este congreso»; en «Mis propuestas» hay una sola |

Comandos: `pnpm test` (integración `tests/integration/001`) · `pnpm build && pnpm test:e2e` (`tests/e2e/001-enviar-propuesta.spec.ts`).
