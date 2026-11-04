# Informe `/speckit-analyze` · spec-001 · iteración 3 (tras clarify-2 y la revisión del plan)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-001-clarify-2` · **Base**: `7282677`
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md después de clarify-2 P4 (títulos repetidos). Presta atención a criterios sin tareas, tareas sin requisito que las justifique, reglas contradictorias y dependencias entre historias. Informa de la gravedad y de los documentos afectados.»
- Informe **inicial**, conservado antes de corregir (§5.2 paso 2).

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| A1 | Inconsistencia | MEDIUM | tasks.md T016 ↔ plan.md decisión 6, research R6 | T016 se escribió durante clarify y propone «comprobar dentro de la transacción con bloqueo». El plan revisado decide un **índice único** en la base de datos. Implementar T016 tal cual contradiría el plan. | Reescribir T016: migración del índice + traducción de `P2002` |
| A2 | Cobertura | MEDIUM | tasks.md «Trazabilidad» | FR-011 y US1-7 no aparecen en la matriz requisito → tareas | Añadir la fila FR-011 / US1-7 |
| A3 | Inconsistencia | LOW | spec.md FR-006 | FR-006 dice que «FR-001 … FR-004» se validan en el servidor; FR-011 también es una regla de servidor y no está incluida | Ampliar FR-006 a «FR-001 … FR-004 y FR-011» |
| A4 | Cobertura | LOW | tasks.md, quickstart #9 | US1-7 solo tiene prueba de servidor; ninguna tarea comprueba que la interfaz muestra el rechazo (el plan dice que no cambia, pero no está verificado) | Tarea e2e corta: repetir el envío y ver la alerta |

**Comprobado sin hallazgos**

- FR-009 («sin límite») y FR-011 no se contradicen: FR-009 remite a FR-011 para los títulos repetidos.
- Pruebas existentes que envían varias propuestas: `001/enviar.test.ts` (h) y `integrado/recorridos.test.ts` (RC-3) usan títulos distintos, y el e2e US1-1 usa `Date.now()` en el título. Son compatibles con FR-011.
- Datos: el seed de desarrollo no tiene ningún par `(autor, congreso, título normalizado)` repetido (consulta en `congresalia`: 0), así que la migración se puede aplicar.
- Constitución: I (índice en vez de bloqueo en el código), IV (regla en la base de datos y en el servidor) y V (registrada primero en `000-core/data-model.md`) ✔.
- Dependencias con otras historias: ninguna. Las propuestas de HU-02 y HU-03 se identifican por `id`, no por título.

Métricas: 11 FR + 3 SC · 16 tareas · cobertura 13/14 (falta FR-011 en la matriz) · ambigüedades 0 · duplicados 0 · CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 2.
