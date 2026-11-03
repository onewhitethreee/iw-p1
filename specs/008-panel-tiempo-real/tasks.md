---
description: "Lista de tareas de spec-008 (HU-08 Consultar el panel del congreso en tiempo real)"
---

# Tasks: Consultar el panel del congreso en tiempo real (HU-08)

**Input**: `/specs/008-panel-tiempo-real/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/panel.md](contracts/panel.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución). **Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-008`

- **[Story]**: US1 = inscripciones e ingresos · US2 = ocupación de cada sesión · US3 = cambiar una sesión de sala

## Phase 1: Setup

- [X] T001 Comprobar la base en `spec-008` (`pnpm test` verde; seed con «Congreso de Innovación Educativa 2026»: 35 confirmadas y 5 pendientes, «Rúbricas compartidas…» con 2/2) — sin dependencias nuevas

## Phase 2: Foundational

- [X] T002 Prueba primero en `packages/domain/tests/ocupacion.test.ts` y después `nivelOcupacion(reservas, asistencias, aforo)` en `packages/domain/src/ocupacion.ts` (exportada en `packages/domain/src/index.ts`): `porcentaje = floor(máx × 100 / aforo)`, `COMPLETA` si máx ≥ aforo, `CASI_COMPLETA` si máx × 100 ≥ 90 × aforo, si no `null` (9/10 casi, 89/100 no, 2/2 completa, 0 reservas y 2 asistencias en aforo 2 completa) — clarify P1, FR-003
- [X] T003 Router vacío `panelRouter` en `apps/web/src/server/api/routers/panel.ts`, registrado como `panel` en `apps/web/src/server/api/root.ts`; fixtures `apps/web/tests/integration/008/fixtures.ts` (congreso con tarifas, salas de aforo 2, 10 y 200, sesiones con horarios conocidos, ayudantes para crear inscripciones con pagos aprobados/rechazados, reservas y asistencias; `ahora` simulable)

## Phase 3: User Story 1 - Inscripciones e ingresos con desglose (P1) 🎯 MVP

**Independent Test**: los totales del panel coinciden con la BD del seed; un pago nuevo aparece en ≤ 5 s.

- [X] T004 [P] [US1] Prueba de integración `apps/web/tests/integration/008/resumen.test.ts` (bloque inscripciones): (a) US1-1 confirmadas, pendientes, `ingresosCent` = suma de pagos `APROBADO` (los `RECHAZADO` no suman) y `desglose` de 6 filas tipo × tarifa con confirmadas, pendientes e ingresos; (b) SC-002 la suma del desglose = total y = `SUM` directo en BD al céntimo; (c) US1-4 congreso sin inscripciones → ceros y 6 filas a cero; (d) US1-2 un pago aprobado nuevo cambia el siguiente `resumen` y `calculadoEn` = `ahora`; (e) US1-3 sin rol ORGANIZADOR (asistente, comité, acreditación) → `FORBIDDEN` en `resumen`, `salasLibres` y `cambiarSala`; congreso inexistente → `NOT_FOUND`
- [X] T005 [US1] Implementar `resumen` (parte de inscripciones e ingresos) en `apps/web/src/server/api/routers/panel.ts` con `groupBy` y una consulta SQL de ingresos por tipo × tarifa (plan R2) — FR-001, FR-002
- [X] T006 [US1] Páginas `apps/web/src/app/organizador/panel/page.tsx` (congresos) y `apps/web/src/app/organizador/panel/[slug]/page.tsx` + `panel.tsx` (cliente): tarjetas «Confirmadas», «Pendientes de pago», «Ingresos» (con `euros()`), tabla de desglose, `refetchInterval: 5000`, «Actualizado a las hh:mm:ss» y, si falla el refresco, «Sin actualizar desde hh:mm:ss» sin perder los datos; enlace «Panel» en `apps/web/src/app/organizador/page.tsx` — US1-1, US1-2, FR-004, FR-006, Edge Cases

## Phase 4: User Story 2 - Ocupación de cada sesión (P1)

**Independent Test**: admitir una entrada y ver la asistencia +1 en ≤ 5 s.

- [X] T007 [P] [US2] Prueba de integración en `apps/web/tests/integration/008/resumen.test.ts` (bloque sesiones): (a) US2-1 por sesión título, sala, horario, aforo, reservas, asistencias, `ocupacion` y `nivel` (P1: 0 reservas y 2 asistencias en aforo 2 → COMPLETA; 9 de 10 → CASI_COMPLETA); (b) US2-2 una asistencia nueva se refleja en el siguiente `resumen`; (c) `movible` falso para una sesión terminada y para todas en un congreso finalizado (P3); (d) SC-004 con 1.000 inscripciones y 50 sesiones `resumen` tarda < 2 s
- [X] T008 [US2] Completar `resumen` (sesiones ordenadas por inicio con `_count` de `agendas` y `asistencias`, `nivelOcupacion`, `movible`) en `apps/web/src/server/api/routers/panel.ts` y la tabla de sesiones con insignias «Completa»/«Casi completa» y la casilla «Solo completas o casi completas» en `panel.tsx` — FR-003, US2-1…US2-3

## Phase 5: User Story 3 - Cambiar una sesión a una sala más grande (P2)

**Independent Test**: «Competencia digital docente» (Aula 3) → Auditorio; el panel muestra aforo 200.

- [X] T009 [P] [US3] Prueba de integración `apps/web/tests/integration/008/cambiar-sala.test.ts`: (a) US3-1 `salasLibres` excluye la sala actual, las que tienen sesión solapada y las de aforo < máx(reservas, asistencias) (P2), ordenadas por aforo; (b) US3-2 `cambiarSala` cambia la sala en la fila `Sesion` (la misma que lee el programa público de spec-003, que se verifica en pantalla al integrar; analyze U1), mantiene reservas y asistencias (Edge Cases) y el siguiente `resumen` muestra el nuevo aforo; (c) US3-3 otra sesión ocupa la sala destino antes de confirmar → `CONFLICT` «La sala «X» ya tiene «título» de HH:mm a HH:mm» y la sesión no cambia; dos cambios simultáneos de sesiones solapadas a la misma sala → solo uno; (d) aforo insuficiente → `CONFLICT`; misma sala → `CONFLICT`; sala de otro congreso → `NOT_FOUND`; (e) US3-4 sesión terminada → `CONFLICT` «La sesión ya ha terminado» (también en `salasLibres`); congreso finalizado → `CONFLICT`; sesión empezada y no terminada → permitido (P3)
- [X] T010 [US3] Implementar `salasLibres` y `cambiarSala` en `apps/web/src/server/api/routers/panel.ts` (plan R4/R5: transacción con `FOR UPDATE` de la sala destino y de la sesión, `primerSolape` del dominio, mensajes del contrato con horas en la zona del congreso) — FR-005
- [X] T011 [US3] En `panel.tsx`, botón «Cambiar de sala» en toda sesión `movible` (la completa es el caso típico; analyze U2), que despliega un selector con las salas libres (nombre y aforo), «Confirmar», «No hay salas libres en ese horario con aforo suficiente» si la lista está vacía (analyze U3) y el error del servidor si lo hay; al confirmar se refresca `resumen` — US3-1, US3-2, SC-003

## Phase 6: Polish

- [X] T012 E2E `apps/web/tests/e2e/008-panel.spec.ts`: organizador ve 35 confirmadas, 5 pendientes y el desglose (US1-1); con el panel abierto se inserta un pago aprobado en la BD y la cifra de ingresos cambia en ≤ 6 s sin recargar (US1-2, SC-001, analyze C1); «Rúbricas compartidas…» → «Cambiar de sala» muestra «No hay salas libres…»; «Rúbricas compartidas…» con «Completa» y filtro (US2-1/US2-3); cambiar «Competencia digital docente» al Auditorio y ver «200» (US3-2); `asistente1` en `/organizador/panel` → acceso denegado (US1-3)
- [X] T013 Regresión completa y resultados en este fichero; [quickstart.md](quickstart.md) e `informes/verificacion.md` (SC-001 refresco 5 s, SC-002, SC-004 medidos)

## Resultados (T013)

Dominio 37/37 · integración 38/38 (spec-008: 16) · e2e 12/12 (spec-008: 5, incluida T014) · lint, typecheck y build sin errores. Detalle en [informes/verificacion.md](informes/verificacion.md).

## Dependencies & Execution Order

T001 → T002 → T003 → US1 (T004 → T005 → T006) → US2 (T007 → T008) → US3 (T009 → T010 → T011) → T012 → T013. T005/T008/T010 mismo router; T006/T008/T011 misma pantalla. Lee datos de spec-004 (pagos), spec-005 (reservas) y spec-006 (asistencias) a través del seed; no depende de la rama spec-003 (plan R4).

## Parallel Example

T004, T007 y T009 están en ficheros de prueba independientes de la implementación y pueden escribirse a la vez tras T003.

## Implementation Strategy

MVP = US1 (cifras e ingresos con refresco). Después US2 (ocupación) y US3 (cambio de sala), cada una con su prueba antes del código.

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (solo organizador) | T004e, T005, T012 |
| FR-002 (inscripciones, ingresos, desglose) | T004a–d, T005, T006 |
| FR-003 (ocupación por sesión, P1) | T002, T007a, T008 |
| FR-004 (refresco ≤ 5 s y hora) | T004d, T006, T013 |
| FR-005 (cambiar de sala, P2/P3) | T009, T010, T011 |
| FR-006 (euros) | T006 |
| US1-1…4 / US2-1…3 / US3-1…4 | T004–T012 |
| SC-001 / SC-002 / SC-003 / SC-004 | T006, T012, T013 / T004b / T011, T012 / T007d |

## Phase 7: Convergence

- [X] T014 En `apps/web/src/app/organizador/panel/[slug]/panel.tsx` mostrar «Sin conexión: no se puede completar la acción. Comprueba la red y vuelve a intentarlo.» cuando `salasLibres` o `cambiarSala` fallan por red (no el mensaje técnico del navegador), y añadir a `apps/web/tests/e2e/008-panel.spec.ts` una prueba que corta `/api/trpc` con `page.route`: aparece «Sin actualizar desde hh:mm:ss», las cifras se conservan y, al volver la red, «Actualizado a las» per Edge Cases «conexión falla» y Constitución VI (partial)
