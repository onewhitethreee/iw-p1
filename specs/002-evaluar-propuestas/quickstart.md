# Quickstart: validar spec-002

Requisitos: base de 000-core con seed. Congreso: `jornadas-pediatria-2027`.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1/2 evaluar | `comite1@` → «Mis evaluaciones» → «Uso racional de antibióticos…» → 8 + comentarios → Guardar | Aparece como evaluada; en ningún lugar sale «Paula Ponente» |
| 2 | US1-3 datos | Puntuación vacía o comentario de 3 caracteres | Error en el campo |
| 3 | US1-4 permisos | `comite3@` intenta abrir una asignación de `comite1@` | «No tienes asignada esta propuesta» |
| 4 | US2-1 asignar | `organizador@` → Propuestas → «Bronquiolitis…» (Enviada) → asignar `comite3` | Pasa a «En evaluación» |
| 5 | US2-2 autoevaluación | Asignar «Alimentación complementaria…» a Pedro Ponente-Comité | «Un evaluador no puede evaluar su propia propuesta» |
| 6 | US3-2 < 2 evaluaciones | Aceptar «Uso racional…» con 1 evaluación | «Se necesitan al menos 2 evaluaciones (tiene 1)» |
| 7 | US3-1 aceptar | Aceptar «Método canguro…» (2 evaluaciones, media 8,5) | «Aceptada» |
| 8 | US1-6 decidida | `comite1@` intenta reevaluar «Método canguro…» | «La propuesta ya está decidida» |
| 9 | SC-001 anonimato | Prueba `anonimato.test.ts` | Ninguna respuesta del comité contiene nombre, correo o id del autor |

Comandos: `pnpm test` · `pnpm build && pnpm test:e2e`.
