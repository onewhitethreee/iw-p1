# Informe `/speckit-analyze` · spec-008 · pasada 1

- **Fecha**: 2026-11-03 · **Artefactos**: spec.md, plan.md, tasks.md, contracts/panel.md, data-model.md, 000-core (contrato, plan), spec-003 (reglas de mover), spec-005/006, seed

## Specification Analysis Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| I1 | Inconsistency | HIGH | spec.md US3 Independent Test · seed · quickstart 7 · T012 | La spec propone mover «Rúbricas…» (Aula 3, en curso) al Auditorio «libre a esa hora», pero en el seed el Auditorio tiene «Aprendizaje basado en proyectos…» solapada (y Sala Magna también). La prueba independiente no puede pasar; quickstart y T012 usan otra sesión | Cambiar el Independent Test a «Competencia digital docente» (Aula 3, mañana) → Auditorio (libre), y añadir que con «Rúbricas…» la lista de salas libres sale vacía («No hay salas libres en ese horario») |
| C1 | Coverage | MEDIUM | SC-001 · FR-004 · T012 | Ninguna prueba comprueba el refresco automático en la pantalla (sin recargar); T004d solo prueba el servidor | Añadir a T012: con el panel abierto, insertar un pago aprobado y ver la cifra cambiar en ≤ 6 s sin recargar |
| U1 | Underspecification | MEDIUM | US3-2 «el programa público se actualiza» · tasks | El programa público es de spec-003 (otra rama); no hay tarea que lo justifique | Anotar en T009b que se comprueba en BD que la sesión cambia de sala (el programa público lee la misma fila `Sesion`); verificación en pantalla al integrar con spec-003 |
| U2 | Underspecification | LOW | US3-1 «una sesión completa» · T011 | El botón aparece en cualquier sesión movible, no solo en las completas | Aclarar en T011 que se ofrece en toda sesión movible (la completa es el caso típico) |
| U3 | Underspecification | LOW | T006/T011 · plan R6 | Sin estado vacío cuando no hay salas libres | Añadir a T011 el mensaje «No hay salas libres en ese horario con aforo suficiente» |

**Coverage Summary Table**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001 | ✔ | T004e, T005, T012 | |
| FR-002 | ✔ | T004, T005, T006 | |
| FR-003 | ✔ | T002, T007, T008 | |
| FR-004 | ✔ | T004d, T006 | C1 (pantalla) |
| FR-005 | ✔ | T009–T011 | |
| FR-006 | ✔ | T006 | |
| SC-001 | parcial | T006, T013 | C1 |
| SC-002 | ✔ | T004b | |
| SC-003 | ✔ | T011, T012 | |
| SC-004 | ✔ | T007d | |

**Constitution Alignment Issues**: ninguno. **Unmapped Tasks**: ninguna.

**Metrics**: requisitos 10 (6 FR + 4 SC) · tareas 13 · cobertura 100 % (SC-001 parcial) · ambigüedades 0 · duplicados 0 · críticos 0.

## Next Actions

Corregir I1 (HIGH) y C1/U1 antes de `/speckit-implement`; U2 y U3 de paso. Repetir el análisis.
