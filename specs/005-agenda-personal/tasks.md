---
description: "Lista de tareas de spec-005 (HU-05 Construir mi agenda personal)"
---

# Tasks: Construir mi agenda personal (HU-05)

**Input**: `/specs/005-agenda-personal/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/agenda.md](contracts/agenda.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución). **Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-005`

- **[Story]**: US1 = añadir respetando solapes y aforo · US2 = consultar y quitar

## Phase 1: Setup

- [x] T001 Comprobar la base en `spec-005` (`pnpm test` en verde; seed con `asistente3` confirmado y agenda vacía en Innovación Educativa)

## Phase 2: Foundational

- [x] T002 Router vacío `agendaRouter` en `apps/web/src/server/api/routers/agenda.ts`, registrado como `agenda` en `apps/web/src/server/api/root.ts`; fixtures `apps/web/tests/integration/005/fixtures.ts` (congreso publicado con sala «Grande» aforo 100 y «Pequeña» aforo 1, sesiones futuras incluidas dos solapadas y dos contiguas, una sesión empezada, asistente con inscripción `CONFIRMADA`, otro `PENDIENTE_PAGO`)

## Phase 3: User Story 1 - Añadir sesiones respetando solapes y aforo (P1) 🎯 MVP

**Independent Test**: `asistente3` añade «Gamificación…»; «Evaluación formativa…» se rechaza por solape.

- [x] T003 [P] [US1] Prueba de integración `apps/web/tests/integration/005/anadir.test.ts`: (a) US1-1 añade y `sesiones` refleja `enAgenda` y `plazasLibres` −1; (b) US1-2 solape → `CONFLICT` «Se solapa con «…» de HH:mm a HH:mm»; (c) US1-3 contiguas aceptadas; (d) US1-4 sala «Pequeña» llena → `CONFLICT` «Aforo completo» y `completa: true`; (e) US1-5/SC-002 20 asistentes a la vez por 1 plaza → 1 aceptado; (f) US1-6 inscripción pendiente o sin inscripción → `FORBIDDEN` «Necesitas una inscripción confirmada en este congreso»; (g) US1-7 duplicada → `CONFLICT` «Esta sesión ya está en tu agenda»; (h) FR-002 programa en borrador → `CONFLICT`; sesión empezada → `CONFLICT` «La sesión ya ha empezado»; (i) dos `anadir` simultáneos de la misma persona con sesiones solapadas → solo uno
- [x] T004 [US1] Implementar `congresos`, `sesiones` y `anadir` en `apps/web/src/server/api/routers/agenda.ts` con bloqueo inscripción → sesión (`FOR UPDATE`) y el orden de validación del plan (R2) — FR-001…FR-005, FR-007, FR-008
- [x] T005 [US1] Páginas `apps/web/src/app/area-personal/agenda/page.tsx` (congresos con inscripción confirmada; vacío «No tienes inscripciones confirmadas») y `apps/web/src/app/area-personal/agenda/[slug]/page.tsx` + `acciones.tsx`: sección «Programa» por día con plazas libres, «Completa», «En tu agenda», «Ya empezada» y botón «Añadir»; errores del servidor en línea; programa en borrador → aviso — US1-1…US1-7, FR-007

## Phase 4: User Story 2 - Consultar y quitar sesiones (P2)

**Independent Test**: quitar una sesión futura libera su plaza.

- [x] T006 [P] [US2] Prueba de integración `apps/web/tests/integration/005/quitar.test.ts`: (a) US2-1 `mia` ordenada por hora; (b) US2-2 quitar libera la plaza; (c) US2-3 quitar una sesión empezada → `CONFLICT`; (d) quitar algo que no está en la agenda → `NOT_FOUND`; (e) US2-4/FR-009 si dos entradas pasan a solaparse (se actualiza una sesión directamente en BD) `mia` devuelve `solapaCon` en ambas y no las quita; (f) un asistente no ve ni puede quitar entradas de otro
- [x] T007 [US2] Implementar `quitar` y `mia` (con `solapaCon`) en `apps/web/src/server/api/routers/agenda.ts` — FR-006, FR-009
- [x] T008 [US2] Sección «Mi agenda» en `apps/web/src/app/area-personal/agenda/[slug]/page.tsx` (por día y hora, sala, aviso «Se solapa con «…»», botón «Quitar» si no ha empezado) — US2-1…US2-4

## Phase 5: Polish

- [x] T009 E2E `apps/web/tests/e2e/005-agenda.spec.ts`: `asistente3` añade «Gamificación…» (US1-1), «Evaluación formativa…» rechazada por solape (US1-2), quita «Gamificación…» (US2-2); «Rúbricas compartidas…» (Aula 3, ya empezada y completa) no ofrece «Añadir»; `asistente4` (pendiente) no tiene congresos en su agenda (US1-6)
- [x] T010 Regresión completa y resultados en este fichero; [quickstart.md](quickstart.md) y `informes/verificacion.md`

## Notas de implementación (iteración 1, 2026-11-03)

- **Dependencia entre specs**: los datos de prueba usan `instanteLocal`, creado en la rama `spec-003`. Se copiaron `packages/domain/src/fechas.ts` y su prueba **idénticos** desde `spec-003` (integración sin conflicto). Antes de copiarlos, las pruebas fallaban al cargar los datos.
- **T003/T006**: 14 de 15 pruebas fallaron antes del código; la (d) de quitar pasaba porque un procedimiento inexistente también devuelve NOT_FOUND (falso verde, se mantiene la prueba porque es válida tras implementar).
- **T009**: `global-setup.ts` copiado de `spec-002` (idéntico).

| Comprobación | Resultado |
|--------------|-----------|
| Integración `tests/integration/005` | 15/15 ✔ (total 37/37) |
| E2E `tests/e2e/005-agenda.spec.ts` | 3/3 ✔ (total 10/10) |
| lint · typecheck · build | sin errores |

## Dependencies & Execution Order

T001 → T002 → US1 (T003 → T004 → T005) → US2 (T006 → T007 → T008) → T009 → T010. T004/T007 mismo router. Consume sesiones (spec-003) e inscripciones confirmadas (spec-004) vía seed; produce las reservas que usan spec-007 (80 %) y spec-008 (ocupación). Integración: enlace «Mi agenda» desde `app/area-personal/page.tsx` (spec-004).

## Parallel Example

```text
Tras T002:  T003 (anadir.test) ∥ T006 (quitar.test)
```

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (solo confirmada) | T003f, T004 |
| FR-002 (publicado, no empezada) | T003h, T004 |
| FR-003 (solape A7) | T003b/c/i, T004 |
| FR-004 (aforo A6, concurrencia) | T003d/e, T004 |
| FR-005 (sin duplicar) | T003g, T004 |
| FR-006 (quitar no empezadas) | T006b/c, T007 |
| FR-007 (plazas, completa, en agenda) | T003a/d, T005 |
| FR-008 (servidor) | T003, T006 |
| FR-010 (vigencia de la reserva, clarify-2 P2) · US1-8 | T012; verificación en la puerta: spec-006 T011 |
| FR-009 (aviso de solape, P1) | T006e, T007, T008 |
| US1-1…7 / US2-1…4 | T003–T009 |
| SC-001 / SC-002 / SC-003 | T003b,i / T003e / T005 (manual) |

## Phase 6: Convergence

- [ ] T011 Al integrar en `main` (después de spec-004), añadir en `apps/web/src/app/area-personal/page.tsx` un enlace «Mi agenda» a `/area-personal/agenda/{slug}` en cada inscripción confirmada per plan: Structure Decision (partial)

## Clarify sobre la versión funcional (2026-11-04) · pendiente de plan y analyze

Tareas que salen de `informes/clarify-2.md`. Se implementan después de revisar `plan.md` y de `/speckit-analyze`.

- [X] T012 Regla de vigencia de la reserva (FR-010, Clarifications P2; plan decisión 7, R6; precisada por analyze-3 A3): `MARGEN_RESERVA_MIN = 10` y `reservaVigente(inicio, ahora)` (`ahora < inicio + 10 min`) en `packages/domain/src/ocupacion.ts`. **Prueba primero** en `packages/domain/tests/ocupacion.test.ts`: antes del inicio, +9:59 → vigente; +10:00 y después → no vigente. **Dependencia** (analyze-3 A1): US1-8 se verifica de extremo a extremo con la prueba de spec-006 T011, que usa esta función (issue #7)
