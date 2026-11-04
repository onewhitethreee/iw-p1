# Informe `/speckit-analyze` · spec-004 · iteración 3 (tras clarify-2 y la revisión del plan)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-004-clarify-2` · **Base**: `10c9ad3`
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md después de clarify-2 P4 (cancelar una inscripción pendiente). Presta atención a criterios sin tareas, tareas sin requisito que las justifique, reglas contradictorias y dependencias entre historias. Informa de la gravedad y de los documentos afectados.»
- Informe **inicial**, conservado antes de corregir (§5.2 paso 2).

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| A1 | Inconsistencia | MEDIUM | tasks.md T014 ↔ plan decisiones 2 y 8, research R7 | T014 (escrita en clarify) pide un **índice parcial** y un bloqueo nuevo; el plan decide **reutilizar la misma fila** con `updateMany` atómicos y mantener la restricción única | Reescribir T014 según el plan |
| A2 | Inconsistencia | MEDIUM | spec.md US2-6 ↔ plan R7 | US2-6 dice que «la primera queda `CANCELADA`… y la nueva se crea». Describe dos filas, es decir, un detalle de datos que el plan resuelve con una sola. El comportamiento que ve el asistente (cancelar, volver a inscribirse al precio de hoy, conservar los intentos de pago) es el mismo | Redactar US2-6 por lo que se observa, sin decir cuántas filas hay. No cambia la decisión, así que no vuelve a clarify |
| A3 | Inconsistencia | MEDIUM | spec.md FR-011 ↔ plan decisión 2 | FR-011: «tipo e importe inmutables una vez creada la inscripción». Al reactivar una cancelada se fijan un tipo y un importe nuevos en la misma fila | Precisar FR-011: inmutables mientras la inscripción no se cancele; al volver a inscribirse se fijan de nuevo (FR-014) |
| A4 | Cobertura / regresión | MEDIUM | tasks.md ↔ `tests/integration/004/inscribir.test.ts` (h) | La prueba (h) comprueba que «no existen operaciones para cambiar ni cancelar»: con FR-014 fallará, y ninguna tarea la actualiza | Añadir a T014 la actualización de (h): `cancelar` existe y sigue sin haber operación para cambiar el tipo. No es rebajar un criterio: lo cambió clarify-2 P4 |
| A5 | Cobertura | MEDIUM | plan decisión 9 ↔ tasks T015 | T015 solo cubre el botón del área personal; la decisión 9 incluye además la insignia «Cancelada», «Inscribirme de nuevo», la página de inscripción (no tratar la cancelada como «ya inscrito») y la redirección de `/area-personal/pago/[id]` | Ampliar T015 |
| A6 | Cobertura | LOW | tasks.md «Trazabilidad» | Faltan FR-014 y US2-6/US2-7 | Añadir la fila |

**Comprobado sin hallazgos**

- Dependencias con otras historias: agenda (`estado = CONFIRMADA`), acreditación (solo los códigos de las confirmadas), certificado (`CONFIRMADA`) y panel (cuenta `CONFIRMADA` y `PENDIENTE_PAGO` por separado) no necesitan cambios: una cancelada queda fuera de todas por su estado. Era la comprobación que dejó pendiente spec-008 clarify-2.
- 000-core: el enum, la transición y `inscripcion.cancelar` están en `data-model.md` y `contracts/trpc-api.md` (Constitución V).
- `pagar` ∥ `cancelar`: el plan (decisión 8) describe el orden en ambos sentidos.

Métricas: 14 FR + 3 SC · 15 tareas · cobertura 15/17 (FR-014 y la decisión 9 incompletas) · CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 1.
