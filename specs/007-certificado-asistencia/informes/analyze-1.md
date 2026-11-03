# Informe `/speckit-analyze` · spec-007 · pasada 1

- **Fecha**: 2026-11-03 · **Artefactos**: spec.md, plan.md, tasks.md, contracts/certificado.md, data-model.md, 000-core (contrato, data-model, plan), spec-005/006

## Specification Analysis Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| I1 | Inconsistency | MEDIUM | spec.md Edge Cases (último) · 000-core contrato `programa.quitar` | La spec dice que una sesión de la agenda puede quitarse del programa; el contrato de 000-core lo impide (`CONFLICT` si está en alguna agenda o tiene asistencias). El caso no puede darse | Reescribir el caso límite: la agenda siempre refleja sesiones programadas porque 000-core impide quitar una sesión reservada |
| U1 | Underspecification | MEDIUM | tasks.md T005 · plan.md R6/estructura | T005 pide llamar al *route handler* «con el usuario simulado», pero el plan no dice cómo inyectar el usuario y el reloj (el handler lee la sesión con Auth.js) | En el plan: el handler es una envoltura fina sobre `respuestaCertificado(usuario, congresoId, ahora)` (en `server/pdf-certificado.ts`), que es lo que prueba T005 |
| U2 | Underspecification | LOW | spec.md P1 · 000-core `inscripcion.crear` (ASISTENTE) · área personal (ASISTENTE) | «Cualquier rol» en la práctica implica ASISTENTE, porque solo ASISTENTE puede inscribirse; no hay conflicto, pero no está escrito | Anotarlo en plan R3 |
| D1 | Inconsistency | LOW | 000-core data-model «% de asistencia» | El valor derivado no recoge el truncado para mostrar (P2); el plan de 000-core sí | Añadir «se muestra truncado a entero (spec-007 P2)» |

**Coverage Summary Table**

| Requirement Key | Has Task? | Task IDs | Notes |
|-----------------|-----------|----------|-------|
| FR-001 | ✔ | T004c, T006 | |
| FR-002 | ✔ | T002, T004, T006 | |
| FR-003 | ✔ | T002, T004, T008 | |
| FR-004 | ✔ | T005, T007 | |
| FR-005 | ✔ | T005, T007 | U1 |
| FR-006 | ✔ | T004d,e, T006 | |
| SC-001 | ✔ | T004, T009 | |
| SC-002 | ✔ | T005a, T010 | |
| SC-003 | ✔ | T004a | |

**Constitution Alignment Issues**: ninguno (V cumplido: contrato y plan de 000-core actualizados antes del plan).

**Unmapped Tasks**: ninguna (T001, T003 y T010 son infraestructura/verificación).

**Metrics**: requisitos 9 (6 FR + 3 SC) · tareas 10 · cobertura 100 % · ambigüedades 0 · duplicados 0 · críticos 0.

## Next Actions

Sin CRITICAL; corregir I1 y U1 (y de paso U2, D1) antes de `/speckit-implement` y repetir el análisis.
