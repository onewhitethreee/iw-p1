# Informe `/speckit-analyze` · spec-005 · iteración 3 (tras clarify-2 y la revisión del plan)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-005-clarify-2`
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md después de clarify-2 P2 (vigencia de la reserva). Presta atención a criterios sin tareas, tareas sin requisito que las justifique, reglas contradictorias y dependencias entre historias. Informa de la gravedad y de los documentos afectados.»
- Informe **inicial**, conservado antes de corregir (§5.2 paso 2).

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| A1 | Dependencia entre historias | MEDIUM | spec.md US1-8 ↔ tasks.md T012 | US1-8 describe lo que pasa **en la puerta** (10:09 rechazo, 10:10 admisión). T012 solo crea la regla; ninguna tarea de spec-005 comprueba US1-8 de extremo a extremo, porque eso lo implementa spec-006 T011 | Anotar en tasks.md que US1-8 se verifica con la prueba de spec-006 T011 y que T012 la precede. No duplicar la prueba aquí |
| A2 | Cobertura | MEDIUM | tasks.md «Trazabilidad» | FR-010 y US1-8 no están en la matriz | Añadir la fila (T012 + spec-006 T011) |
| A3 | Inconsistencia | LOW | tasks.md T012 ↔ plan decisión 7 | T012 dice «en `packages/domain/src/`», sin fichero; el plan elige `ocupacion.ts` con la constante `MARGEN_RESERVA_MIN` | Precisar T012 |

**Comprobado sin hallazgos**

- La decisión 5 (plazas libres = `aforo − reservas`) no se contradice con FR-010: solo se añaden sesiones no empezadas (FR-002), y antes del inicio toda reserva está vigente.
- FR-006 (quitar solo sesiones no empezadas) y FR-010 son compatibles: la reserva no se borra al liberarse.
- Constitución V: A6 se ha anotado en `docs/agrupamiento.md` y en `000-core/data-model.md`.
- Panel (spec-008): la ocupación = máx(reservas, asistencias) sigue siendo correcta, como se razonó en spec-008 clarify-2.

Métricas: 10 FR + 3 SC · 12 tareas · cobertura 11/12 · CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 1.
