# Informe `/speckit-converge` · spec-001 · iteración 2 (tras clarify-2 e implement T016–T017)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-001-clarify-2` · **Base**: `24b6176`
- **Instrucción**: «Contrasta la implementación actual con spec.md, plan.md y tasks.md. Revisa los criterios de aceptación, los casos de error y las obligaciones técnicas documentadas. Identifica el trabajo pendiente y añade tareas trazables para completarlo.»
- **Resultado**: `tasks_appended` · 1 tarea (T018)
- Una tarea marcada `[X]` no se ha tomado como prueba: cada obligación se ha comprobado en el código y con su prueba.

| ID | Tipo | Gravedad | Origen | Evidencia | Tarea |
|----|------|----------|--------|-----------|-------|
| F2 | contradicts (documentación) | LOW | plan.md «Project Structure» | El plan cita `tests/integration/001/propuesta.test.ts`, que no existe (son `enviar.test.ts`, `mias.test.ts` y `fixtures.ts`). Además no cita la migración `20261105100000_propuesta_titulo_unico` de la decisión 6. Venía de la iteración 1; la detecta ahora porque la decisión 6 añade un fichero. | T018 |

**Comprobado sin brechas**

- FR-011: índice `Propuesta_autor_congreso_titulo_key` en la migración; `P2002` → `CONFLICT` con el mensaje exacto del contrato (`propuesta.ts`); pruebas (k)–(n) y e2e US1-7 en verde.
- Plan decisión 6 / R6: no hay `findFirst` ni bloqueo en el código; la regla la garantiza la base de datos. Comprobado también que `prisma migrate diff` no propone borrar el índice.
- FR-006 (FR-011 en el servidor): la regla está en la BD y en el router, no solo en la interfaz.
- `000-core/data-model.md`: la nota del índice coincide con la migración.
- Sin código no justificado: el diff de `24b6176` solo toca lo que piden T016/T017.

**Abierto, no accionable con código**: T015 (medición con personas de SC-001) → [#1](https://github.com/onewhitethreee/iw-p1/issues/1).

Métricas: 11 FR + 3 SC · 12 escenarios + 4 casos límite · 6 decisiones del plan · missing 0 / partial 0 / contradicts 1 (doc) / unrequested 0 · CRITICAL 0 / HIGH 0 / MEDIUM 0 / LOW 1.
