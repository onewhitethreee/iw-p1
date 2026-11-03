# Quickstart: validar spec-003

Requisitos: base de 000-core con seed. `jornadas-pediatria-2027` tiene 4 ponencias aceptadas sin programar (2 de Pablo Ponente) y el programa en borrador; `congreso-innovacion-educativa-2026` está publicado y «Rúbricas compartidas…» (Aula 3) tiene 2 reservas.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 | `organizador@` → Programa (Pediatría) → «Vacunación…» en Auditorio, primer día 10:00–10:30 | Aparece en el programa; desaparece de pendientes |
| 2 | US1-2 solape de ponente | «Alergias alimentarias…» (también de Pablo) en Sala A 10:15–10:45 | «Pablo Ponente ya tiene la sesión «Vacunación…» de 10:00 a 10:30» |
| 3 | US1-3 solape de sala | «Lactancia materna…» en Auditorio 10:00–10:30 | «La sala Auditorio está ocupada por…» |
| 4 | US1-4 contiguas | «Alergias…» en Sala A 10:30–11:00 | Aceptada |
| 5 | US2-3 aforo | En Innovación, mover «Rúbricas…» a una sala con aforo < 2 | Rechazo con «… y la sesión tiene 2 reservas» (integración) |
| 6 | US3-2 borrador | Visitante abre `/congresos/jornadas-pediatria-2027/programa` | «El programa aún no se ha publicado» |
| 7 | US3-1/3 publicar | Publicar → visitante abre la página; `curl` del HTML | Sesiones en el HTML, `<title>`, canonical, JSON-LD `Event`; aparece en `/sitemap.xml` |
| 8 | US2-5 / P1 | Integración con `ahora` dentro de una sesión: cambiar hora → rechazo; cambiar sala → aceptado | |
| 9 | SC-002 | Lighthouse SEO sobre la página publicada | ≥ 90 |

Comandos: `pnpm test` · `pnpm build && pnpm test:e2e`.
