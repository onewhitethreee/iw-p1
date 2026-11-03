# Verificación de spec-002 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-002` · **Datos**: seed de 000-core (`jornadas-pediatria-2027`), recargado por `tests/e2e/global-setup.ts`
- **Ejecutado por**: pruebas automáticas (Vitest + Playwright); el responsable revisa este registro

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1/2 evaluar | e2e «comite1 evalúa sin ver al autor» + integración evaluar (a)(b) | Evaluada (8); sin «Paula Ponente» | Igual | ✔ |
| 2 | US1-3 datos | e2e (comentario corto) + integración (c) | Error del campo | «Los comentarios deben tener entre 10 y 2000 caracteres»; 0, 11 y 7,5 → BAD_REQUEST | ✔ |
| 3 | US1-4 permisos | integración (d) | FORBIDDEN «No tienes asignada esta propuesta» | Igual (también con id inexistente) | ✔ |
| 4 | US2-1 asignar | e2e «Bronquiolitis… a comite3» + integración asignar (a) | En evaluación | Igual | ✔ |
| 5 | US2-2 autoevaluación | e2e + integración (b) | «Un evaluador no puede evaluar su propia propuesta» | Igual; estado sigue «Enviada» | ✔ |
| 6 | US3-2 < 2 evaluaciones | e2e «Obesidad infantil» + integración decidir (b) | «Se necesitan al menos 2 evaluaciones (tiene N)» | Igual (tiene 0 / tiene 1) | ✔ |
| 7 | US3-1 aceptar | e2e «Método canguro» (media 8,5) + integración (a) | Aceptada | Igual | ✔ |
| 8 | US1-6 decidida | e2e (solo lectura) + integración evaluar (f) | «La propuesta ya está decidida» | Igual; puntuación sin cambios | ✔ |
| 9 | SC-001 anonimato | `anonimato.test.ts` | Sin nombre, correo, id, `autorId` ni `autor` | 0 apariciones en 5 respuestas | ✔ |
| — | US3-5 / P2 sin nota mínima | integración decidir (e) | Media 4,5 aceptable | Aceptada | ✔ |
| — | Carreras (analyze U1) | integración decidir (f)(f2), 5 repeticiones | Una sola decisión; ninguna evaluación posterior a la decisión | Igual | ✔ |
| — | FR-010 / P1 | integración asignar (g) | Sin `quitarAsignacion` | 7 procedimientos exactos | ✔ |

## SC-003 (evaluar en menos de 2 minutos)

El formulario tiene 2 campos (puntuación y comentarios) y el recorrido e2e de evaluación tarda unos 3 s.
La medición con una persona real queda **pendiente de realizar por el responsable** durante la grabación de la demo.

## Regresión

dominio 34/34 · integración 50/50 (000-core 22 + spec-002 28) · e2e 14/14 (000-core 7 + spec-002 7) · lint y typecheck sin errores.
