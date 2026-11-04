# Informe `/speckit-analyze` · spec-007 · iteración 3 (tras clarify-2 y la revisión del plan)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-007-clarify-2`
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md después de clarify-2 P3 (sesiones solapadas). Presta atención a criterios sin tareas, tareas sin requisito que las justifique, reglas contradictorias y dependencias entre historias. Informa de la gravedad y de los documentos afectados.»
- Informe **inicial**, conservado antes de corregir (§5.2 paso 2). *Lección de spec-006: se revisan también las pruebas e2e y el seed, no solo las de integración.*

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| A1 | Cobertura | MEDIUM | plan decisión 7 ↔ tasks T013 | El plan añade la frase «Las sesiones de tu agenda que se solapan cuentan como una» cuando hay turnos de varias sesiones; T013 no la incluye ni la prueba | Ampliar T013 y añadir la comprobación en integración (dato) y en la pantalla |
| A2 | Inconsistencia | LOW | tasks.md T012 ↔ plan decisión 4 | T012 habla de «grupos de solape (componentes conexos)» sin nombrar la función que fija el plan (`recuentoPorTurnos`), y no incluye el caso de sesiones contiguas (A7), que no deben agruparse | Precisar T012 y añadir el caso contiguo |
| A3 | Cobertura | LOW | tasks.md «Trazabilidad» | Falta la fila de clarify-2 P3 / US1-8 | Añadir |

**Comprobado sin hallazgos**

- Pruebas existentes (`007/estado.test.ts`, `descarga.test.ts`, e2e `007-certificado.spec.ts`): las agendas del fixture y del seed del congreso finalizado no tienen solapes (fixture: sesiones cada 120 min de 60–90 min; seed: `asistente1` 4 de 5 y `asistente2` 3 de 5 sin solapes), así que con turnos dan los mismos números (80 %, 60 %).
- RC-1 (`integrado/recorridos.test.ts`): sesiones separadas 2 h; sin cambios.
- Horas de formación: siguen sumando sesiones, sin contradicción con FR-004, porque spec-006 FR-011 ya no permite dos asistencias solapadas.
- Dependencia con spec-005 P1 (los solapes llegan por cambios del programa): la regla no depende de cómo se produjo el solape.

Métricas: 6 FR + 3 SC · 13 tareas · cobertura 8/9 · CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 2.
