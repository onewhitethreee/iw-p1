# Informe `/speckit-converge` · spec-004 · iteración 2 (tras clarify-2 e implement T014–T015)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-004-clarify-2` · **Base**: `5016a3f`
- **Instrucción**: «Contrasta la implementación actual con spec.md, plan.md y tasks.md. Revisa los criterios de aceptación, los casos de error y las obligaciones técnicas documentadas. Identifica el trabajo pendiente y añade tareas trazables para completarlo.»
- **Resultado**: `tasks_appended` · 1 tarea (T016). Las tareas `[X]` no se han tomado como prueba: cada obligación se ha comprobado en el código y con su prueba.

| ID | Tipo | Gravedad | Origen | Evidencia | Tarea |
|----|------|----------|--------|-----------|-------|
| F1 | contradicts (documentación) | LOW | `data-model.md` de spec-004 ↔ FR-011 revisado, plan R7 | La tabla dice «tipo, tarifa e importe fijados al crear e **inmutables** (clarify P1); `estado PENDIENTE_PAGO → CONFIRMADA`». Falta `CANCELADA`, y «inmutables» contradice la reactivación, que ya está implementada en `inscripcion.crear` | T016 |
| F2 | contradicts (documentación) | LOW | `plan.md` «Summary» | Dice «router `inscripcion` (4 procedimientos)… Sin entidades ni migraciones nuevas»; el código tiene 5 procedimientos y la migración `inscripcion_cancelada` | T016 |

**Comprobado sin brechas**

- FR-014: `cancelar` con `updateMany` condicionado (solo el titular, solo `PENDIENTE_PAGO`) y motivos del contrato; pruebas (a)–(g).
- FR-003 / R7: con `P2002` solo se reactiva una `CANCELADA`, en una sola fila (prueba (b), `count = 1`).
- FR-011: el tipo no se puede cambiar sin cancelar (prueba (h) de `inscribir`: no hay ninguna operación para cambiarlo).
- Decisión 3: `pagar` rechaza una cancelada sin crear pago (f).
- Decisión 9: insignia «Cancelada», «Inscribirme de nuevo», confirmación sin `window.confirm`, página de inscripción y redirección del pago (e2e US2-6 y revisión de `inscripcion/page.tsx` y `pago/[inscripcionId]/page.tsx`).
- 000-core: enum, transición y `inscripcion.cancelar` en el modelo y el contrato, coherentes con el código.
- Otras historias: agenda, acreditación, certificado y panel filtran por estado; regresión 178/178 y 48/48.
- Sin código no justificado: el diff de `5016a3f` solo toca lo que piden T014/T015.

**Abierto, no accionable con código**: T013 (medición con personas de SC-001) → [#4](https://github.com/onewhitethreee/iw-p1/issues/4).

Métricas: 14 FR + 3 SC · 9 decisiones del plan · missing 0 / partial 0 / contradicts 2 (doc) / unrequested 0 · CRITICAL 0 / HIGH 0 / MEDIUM 0 / LOW 2.
