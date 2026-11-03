---
description: "Lista de tareas de spec-002 (HU-02 Evaluar propuestas de forma anónima)"
---

# Tasks: Evaluar propuestas de forma anónima (HU-02)

**Input**: `/specs/002-evaluar-propuestas/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/evaluacion.md](contracts/evaluacion.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución: pruebas de reglas e e2e). Prueba específica de anonimato (SC-001).

**Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-002`

## Format: `[ID] [P?] [Story] Description`

- **[Story]**: US1 = evaluar sin conocer al autor · US2 = asignar evaluadores · US3 = aceptar o rechazar

---

## Phase 1: Setup

- [x] T001 Comprobar la base en la rama `spec-002` (`pnpm test` en verde; seed con `comite1` asignado a «Uso racional de antibióticos en otitis media» con 1 evaluación de `comite2`, y «Método canguro en prematuros extremos» con 2 evaluaciones)

---

## Phase 2: Foundational

- [x] T002 Crear `evaluacionSchema` (zod) en `apps/web/src/lib/esquemas/evaluacion.ts`: `asignacionId` string; `puntuacion` **entero de 1 a 10** («La puntuación debe ser un número entero de 1 a 10»); `comentarios` recortado de **10–2000 caracteres** («Los comentarios deben tener entre 10 y 2000 caracteres») — FR-006
- [x] T003 Crear `evaluacionRouter` con la constante `SELECT_ANONIMO` (vista anónima de data-model.md: `propuesta.{titulo, resumen, estado, area.nombre, congreso.{nombre, slug}}`, sin `autorId` ni `autor`) en `apps/web/src/server/api/routers/evaluacion.ts` y registrarlo como `evaluacion` en `apps/web/src/server/api/root.ts` — FR-005, plan R1
- [x] T004 [P] Helper de pruebas `escenario()` en `apps/web/tests/integration/002/fixtures.ts` que crea un congreso con área, un autor con nombre y correo reconocibles («Autora Secreta», `autora.secreta@test.es`), una propuesta `ENVIADA`, un organizador y tres miembros del comité

---

## Phase 3: User Story 1 - Evaluar una propuesta asignada sin conocer al autor (P1) 🎯 MVP

**Goal**: el evaluador ve solo lo suyo, sin autor, y puntúa con comentarios.

**Independent Test**: `comite1` evalúa «Uso racional…» y en ningún lugar aparece «Paula Ponente».

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Prueba de integración en `apps/web/tests/integration/002/evaluar.test.ts`: (a) US1-1 `misAsignaciones` devuelve solo las del evaluador con `evaluada` correcta; (b) US1-2 `evaluar` con 8 y comentarios guarda la evaluación; (c) US1-3 puntuación 0, 11, 7.5 o comentarios de 9 caracteres → `BAD_REQUEST` sin guardar; (d) US1-4 `detalle`/`evaluar` sobre asignación ajena o inexistente → `FORBIDDEN` «No tienes asignada esta propuesta»; (e) US1-5 evaluar de nuevo sin decidir actualiza la misma evaluación (sigue habiendo 1); (f) US1-6 propuesta `ACEPTADA` o `RECHAZADA` → `CONFLICT` «La propuesta ya está decidida» sin cambios; (g) usuario sin rol COMITE → `FORBIDDEN`; (h) Edge Case: un evaluador no recibe puntuaciones ni comentarios de otros evaluadores
- [x] T006 [P] [US1] Prueba de anonimato en `apps/web/tests/integration/002/anonimato.test.ts` (SC-001, FR-005): con el `escenario()`, serializar con `JSON.stringify` la salida de `misAsignaciones`, `detalle` y la respuesta de `evaluar` y comprobar que no contiene el nombre, el correo ni el id del autor; incluye un usuario PONENTE+COMITE que nunca ve sus propias propuestas en `misAsignaciones` (Edge Case)

### Implementation for User Story 1

- [x] T007 [US1] Implementar `misAsignaciones` (`{ congresoId? }`), `detalle` y `evaluar` (upsert sobre `asignacionId`, comprobando que la asignación es del usuario y, dentro de una transacción que bloquea la fila de la propuesta con `SELECT … FOR UPDATE`, que `estaDecidida(estado)` es falso) con `roleProcedure("COMITE")` y `SELECT_ANONIMO` en `apps/web/src/server/api/routers/evaluacion.ts` — FR-004…FR-006, FR-009
- [x] T008 [US1] Página «Mis evaluaciones» en `apps/web/src/app/comite/page.tsx`: tabla con congreso, título, área, estado de la propuesta, «Pendiente»/«Evaluada (N)» y enlace «Evaluar»/«Ver»; vacío «No tienes propuestas asignadas» — US1-1
- [x] T009 [US1] Página de evaluación en `apps/web/src/app/comite/evaluar/[asignacionId]/page.tsx` + `formulario.tsx` (react-hook-form + `evaluacionSchema`): título, área y resumen (sin autor), selector de puntuación 1–10, comentarios con contador; si la propuesta está decidida, formulario en solo lectura con aviso «La propuesta ya está decidida»; `FORBIDDEN` → página «Acceso denegado» — US1-2, US1-3, US1-5, US1-6

**Checkpoint**: US1 funcional.

---

## Phase 4: User Story 2 - Asignar evaluadores (P1)

**Goal**: el organizador asigna miembros del comité; la primera asignación pasa la propuesta a `EN_EVALUACION`.

**Independent Test**: asignar «Bronquiolitis…» (ENVIADA) a `comite3` → «En evaluación» y aparece en «Mis evaluaciones» de `comite3`.

### Tests for User Story 2 ⚠️

- [x] T010 [P] [US2] Prueba de integración en `apps/web/tests/integration/002/asignar.test.ts`: (a) US2-1 primera asignación → `EN_EVALUACION`; segunda → sigue `EN_EVALUACION`; (b) US2-2 asignar al autor (usuario PONENTE+COMITE) → `CONFLICT` «Un evaluador no puede evaluar su propia propuesta»; (c) US2-3 repetir evaluador → `CONFLICT` «Ese evaluador ya tiene asignada esta propuesta»; (d) US2-4 usuario sin rol COMITE → `BAD_REQUEST` «El usuario no pertenece al comité científico»; (e) US2-5 no organizador → `FORBIDDEN`; (f) propuesta decidida → `CONFLICT`; (g) FR-010/clarify P1: el router no tiene `quitarAsignacion` (inspeccionar `appRouter._def.procedures`); (h) `miembrosComite` lista solo usuarios con rol COMITE

### Implementation for User Story 2

- [x] T011 [US2] Implementar `miembrosComite` y `asignar` (transacción: `asignacion.create` + `propuesta.update` con `estadoTrasAsignar`; `P2002` → `CONFLICT`) con `roleProcedure("ORGANIZADOR")` en `apps/web/src/server/api/routers/evaluacion.ts` — FR-001…FR-003, FR-010
- [x] T012 [US2] Implementar `resumenOrganizador` (`{ congresoId }`: propuestas con autor, área, estado, `nEvaluaciones`, `media` redondeada a 1 decimal o `null`, evaluadores asignados con `evaluada`) en `apps/web/src/server/api/routers/evaluacion.ts` — FR-008
- [x] T013 [US2] Página `apps/web/src/app/organizador/page.tsx` (lista de congresos con enlace «Propuestas») y `apps/web/src/app/organizador/[slug]/propuestas/page.tsx` + `acciones.tsx`: tabla con título, autor, área, estado, evaluadores (✓ si evaluó), nº evaluaciones y media (es-ES); por fila, selector «Asignar evaluador» con `miembrosComite` y botón «Asignar»; errores del servidor en línea — US2-1…US2-5, US3-4

**Checkpoint**: US1 y US2 funcionales.

---

## Phase 5: User Story 3 - Aceptar o rechazar con al menos dos evaluaciones (P2)

**Goal**: decisión del organizador con mínimo de 2 evaluaciones y sin nota mínima.

**Independent Test**: aceptar «Uso racional…» (1 evaluación) → rechazado; aceptar «Método canguro…» (2) → «Aceptada».

### Tests for User Story 3 ⚠️

- [x] T014 [P] [US3] Prueba de integración en `apps/web/tests/integration/002/decidir.test.ts`: (a) US3-1 con 2 evaluaciones `ACEPTAR` → `ACEPTADA` y `decididaEn` fijada; `RECHAZAR` → `RECHAZADA`; (b) US3-2 con 1 → `CONFLICT` «Se necesitan al menos 2 evaluaciones (tiene 1)»; (c) US3-3 ya decidida → `CONFLICT` «La propuesta ya está decidida»; (d) `ENVIADA` sin evaluadores → `CONFLICT`; (e) US3-5/clarify P2: media 4,5 se puede aceptar; (f) dos decisiones simultáneas (`Promise.allSettled`) → exactamente una se aplica; (f2) analyze U1: `evaluar` y `decidir` simultáneos → o la evaluación queda guardada antes de la decisión o se rechaza con «La propuesta ya está decidida», y la evaluación nunca tiene `updatedAt` posterior a `decididaEn`; (g) no organizador → `FORBIDDEN`; (h) Edge Case: con 3 asignados y 2 evaluaciones ya se puede decidir; (i) `resumenOrganizador` ordena/expone `media` y `nEvaluaciones` correctos

### Implementation for User Story 3

- [x] T015 [US3] Implementar `decidir` (transacción con `SELECT … FOR UPDATE` sobre la propuesta, recuento de evaluaciones dentro del bloqueo, `puedeDecidir` de `@congresalia/domain` y actualización de estado y `decididaEn`, R4) en `apps/web/src/server/api/routers/evaluacion.ts` — FR-007, FR-011
- [x] T016 [US3] Botones «Aceptar» y «Rechazar» por fila en `apps/web/src/app/organizador/[slug]/propuestas/acciones.tsx` (desactivados con aviso «Faltan N evaluaciones» si hay < 2; ocultos si está decidida) y ordenación por media con `?orden=media` en `page.tsx` — US3-1…US3-4

**Checkpoint**: HU-02 completa.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T017 Prueba e2e en `apps/web/tests/e2e/002-evaluar-propuestas.spec.ts`: `comite1` evalúa «Uso racional…» sin ver «Paula Ponente» (US1-1/2/SC-001); comentario corto → error (US1-3); `organizador` asigna «Bronquiolitis…» a `comite3` → «En evaluación» (US2-1); asignar «Alimentación complementaria…» a Pedro Ponente-Comité → error (US2-2); aceptar con 1 evaluación → error (US3-2); aceptar «Método canguro…» → «Aceptada» (US3-1); `comite1` reevaluar «Método canguro…» → «La propuesta ya está decidida» (US1-6); `asistente1` en `/comite` → «Acceso denegado»
- [x] T018 Regresión completa (`pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e`) y resultados en este fichero
- [x] T019 Recorrer [quickstart.md](quickstart.md) y registrar lo observado en `specs/002-evaluar-propuestas/informes/verificacion.md`; incluir la medición manual de SC-003 (evaluar en < 2 min) o dejarla explícitamente pendiente para el responsable

---

## Notas de implementación (iteración 1, 2026-11-03)

- **Entorno**: al empezar, PostgreSQL estaba parado (contenedor reiniciado, error P1001); se volvió a arrancar. No afecta al código.
- **T002**: la carpeta `src/lib/esquemas/` la había creado spec-001 en su rama; en `spec-002` (que parte de `main`) hubo que crearla.
- **T004**: el primer `escenario()` usaba siempre el mismo correo y las pruebas con bucles fallaban por unicidad; se añadió un sufijo. Fallo de la prueba, no del router.
- **T016 (desviación consciente)**: «Aceptar»/«Rechazar» no se desactivan con < 2 evaluaciones; se muestra «Faltan N evaluaciones» y el **servidor** rechaza la operación. Así US3-2 se puede demostrar en la interfaz (Constitución IV).
- **T017**: se añadió `tests/e2e/global-setup.ts` para recargar el seed antes de cada ejecución e2e (las pruebas cambian datos).
- **SC-003**: medición humana pendiente (ver `informes/verificacion.md`).

### Resultados

| Comprobación | Resultado |
|--------------|-----------|
| Integración `tests/integration/002` | 28/28 ✔ (total 50/50) |
| E2E `tests/e2e/002-evaluar-propuestas.spec.ts` | 7/7 ✔ (total 14/14) |
| `packages/domain` | 34/34 ✔ |
| lint · typecheck · build | sin errores |

## Dependencies & Execution Order

- T001 → T002, T003, T004 → US1 (T005, T006 → T007 → T008, T009) → US2 (T010 → T011 → T012 → T013) → US3 (T014 → T015 → T016) → T017 → T018 → T019
- T007, T011, T012 y T015 editan el mismo router: en serie. T013 y T016 editan la misma pantalla: en serie.
- Consume propuestas de spec-001 (el seed ya las tiene); produce propuestas `ACEPTADA` que necesita spec-003.

## Parallel Example

```text
Tras T003/T004:  T005 (evaluar.test) ∥ T006 (anonimato.test) ∥ T010 (asignar.test) ∥ T014 (decidir.test)
```

## Implementation Strategy

US1 (MVP: el comité ya puede evaluar las asignaciones del seed) → US2 → US3 → e2e y verificación.

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (solo organizador asigna) | T010e, T011 |
| FR-002 (no al autor, no dos veces) | T010b/c, T011 |
| FR-003 (primera → EN_EVALUACION) | T010a, T011 |
| FR-004 (solo asignadas) | T005a/d, T007 |
| FR-005 (anonimato) | T003, T006, T007, T017 |
| FR-006 (1–10, comentarios, una por evaluador) | T002, T005b/c/e, T007, T009 |
| FR-007 (decidir con ≥ 2) | T014a/b/c/d, T015 |
| FR-008 (media y número) | T012, T014i, T013 |
| FR-009 (servidor) | T005, T010, T014 (`createCaller`) |
| FR-010 (asignaciones permanentes, P1) | T010g |
| FR-011 (sin nota mínima, P2) | T014e |
| US1-1…6 | T005, T008, T009, T017 |
| US2-1…5 | T010, T013, T017 |
| US3-1…5 | T014, T016, T017 |
| SC-001 / SC-002 / SC-003 | T006 / T014b / T019 |

## Phase 7: Convergence

- [ ] T020 Medir con una persona real el tiempo desde abrir una asignación pendiente en `/comite` hasta ver «Evaluación guardada» (objetivo < 2 min tras leer el resumen) y registrarlo en `specs/002-evaluar-propuestas/informes/verificacion.md` per SC-003 (partial)
