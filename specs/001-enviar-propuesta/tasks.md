---
description: "Lista de tareas de spec-001 (HU-01 Enviar propuesta de ponencia)"
---

# Tasks: Enviar propuesta de ponencia (HU-01)

**Input**: Documentos de diseño en `/specs/001-enviar-propuesta/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/propuesta.md](contracts/propuesta.md), base [000-core](../000-core/tasks.md) completada

**Tests**: SÍ (Constitución, «Restricciones técnicas»: pruebas de las reglas de negocio y e2e de los recorridos principales).

**Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-001`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 = enviar propuesta dentro del plazo · US2 = consultar mis propuestas

---

## Phase 1: Setup

**Purpose**: no hay infraestructura nueva; se reutiliza la de 000-core.

- [x] T001 Comprobar que la base de 000-core está en marcha en la rama `spec-001` (`pnpm test` en verde y `pnpm db:seed` con el congreso `jornadas-pediatria-2027` en llamada abierta)

---

## Phase 2: Foundational

**Purpose**: esquema de validación compartido y registro del router (bloquea US1 y US2).

- [x] T002 Crear `propuestaSchema` (zod) en `apps/web/src/lib/esquemas/propuesta.ts` con: `congresoId` string no vacío; `areaId` string no vacío («Elige un área temática»); `titulo` recortado de **5–200 caracteres** («El título debe tener entre 5 y 200 caracteres»); `resumen` recortado de **100–3000 caracteres** («El resumen debe tener entre 100 y 3000 caracteres») — FR-001, contracts/propuesta.md
- [x] T003 Crear el router vacío `propuestaRouter` en `apps/web/src/server/api/routers/propuesta.ts` y registrarlo como `propuesta` en `apps/web/src/server/api/root.ts`

**Checkpoint**: router registrado; ya se pueden escribir las pruebas.

---

## Phase 3: User Story 1 - Enviar una propuesta dentro del plazo (Priority: P1) 🎯 MVP

**Goal**: el ponente envía una propuesta válida dentro del plazo y queda en estado `ENVIADA`.

**Independent Test**: `ponente1` envía una propuesta a `jornadas-pediatria-2027` y la ve en «Mis propuestas».

### Tests for User Story 1 ⚠️ (deben fallar antes de implementar)

- [x] T004 [P] [US1] Prueba de integración `propuesta.enviar` en `apps/web/tests/integration/001/enviar.test.ts`: (a) US1-1 crea la propuesta con `estado ENVIADA`, `autorId` = usuario de la sesión y `enviadaEn` = `ahora`; (b) FR-002/FR-005a con `ahora` = 23:59 del día de cierre (hora del congreso) → aceptada, y con `ahora` = 00:00 del día siguiente → `CONFLICT` «El plazo de envío de propuestas de este congreso está cerrado» sin guardar nada (US1-2); (c) antes del día de apertura → `CONFLICT` con «se abre el» (US1-3); (d) US1-4 resumen de 99 caracteres o título de 4 → `BAD_REQUEST` sin guardar; (e) US1-5 área de otro congreso → `BAD_REQUEST` «El área temática no pertenece a este congreso»; (f) US1-6 usuario solo ASISTENTE → `FORBIDDEN`, sin sesión → `UNAUTHORIZED`; (g) congreso inexistente → `NOT_FOUND`; (h) FR-009/clarify P2: un ponente con 3 propuestas envía una cuarta → aceptada; (i) FR-008/clarify P1: el router `propuesta` no expone `editar` ni `retirar`; (j) la entrada ignora un `autorId` ajeno (el autor es siempre el usuario de la sesión)

### Implementation for User Story 1

- [x] T005 [US1] Implementar `propuesta.enviar` (`roleProcedure("PONENTE")`) en `apps/web/src/server/api/routers/propuesta.ts`: congreso por id (`NOT_FOUND`), `plazoEnvio(congreso, ctx.ahora())` de `@congresalia/domain` con mensajes de contracts/propuesta.md (`NO_ABIERTO` cita `fecha(envioAbre, zonaHoraria)`), área perteneciente al congreso, `create` con `autorId: ctx.usuario.id`, `estado: "ENVIADA"`, `enviadaEn: ctx.ahora()`; devuelve `{ id, estado }` — FR-001…FR-006
- [x] T006 [US1] Página `/ponente/enviar` (Server Component) en `apps/web/src/app/ponente/enviar/page.tsx`: obtiene `congreso.listar`, filtra `fase === "LLAMADA_ABIERTA"`, carga las áreas de cada uno con `congreso.porSlug` y muestra el día de cierre como «hasta el {día}» (`fecha(envioCierra − 1 ms)`); si no hay ninguno, mensaje «Ahora mismo no hay ningún congreso con la llamada a comunicaciones abierta» — FR-007
- [x] T007 [US1] Formulario cliente en `apps/web/src/app/ponente/enviar/formulario.tsx` con react-hook-form + `zodResolver(propuestaSchema)`: selector de congreso, selector de área dependiente del congreso, título, resumen con contador «N / 3000 (mínimo 100)», errores por campo y error del servidor en `Alert`; botón desactivado y «Enviando…» mientras la mutación está pendiente (Edge Case doble clic); al terminar, `router.push("/ponente?enviada=1")` — US1-1, US1-4
- [x] T008 [US1] Prueba e2e en `apps/web/tests/e2e/001-enviar-propuesta.spec.ts`: `ponente1` envía una propuesta válida y ve «Propuesta enviada» y la propuesta con estado «Enviada» (US1-1); resumen corto muestra el error del campo (US1-4); `asistente1` en `/ponente/enviar` ve «Acceso denegado» y un visitante sin sesión es llevado a `/entrar?desde=%2Fponente%2Fenviar` (US1-6)

**Checkpoint**: US1 funcional y probada.

---

## Phase 4: User Story 2 - Consultar mis propuestas y su estado (Priority: P2)

**Goal**: el ponente ve solo sus propuestas, con su estado, de la más reciente a la más antigua.

**Independent Test**: `ponente1` ve sus propuestas del seed en los 4 estados y ninguna de `ponente2`.

### Tests for User Story 2 ⚠️

- [x] T009 [P] [US2] Prueba de integración `propuesta.mias` en `apps/web/tests/integration/001/mias.test.ts`: (a) US2-1 devuelve solo las del autor ordenadas por `enviadaEn` descendente; (b) US2-2 no devuelve propuestas de otro ponente; (c) FR-010/clarify P3: cada elemento tiene **exactamente** las claves `id, titulo, resumen, estado, enviadaEn, area, congreso` (sin asignaciones, evaluaciones, puntuaciones ni evaluadores) aunque la propuesta tenga evaluaciones; (d) filtro opcional `congresoId`; (e) sin rol PONENTE → `FORBIDDEN`

### Implementation for User Story 2

- [x] T010 [US2] Implementar `propuesta.mias` (`roleProcedure("PONENTE")`, entrada `{ congresoId?: string }`) con `select` explícito de los campos de FR-010 y `orderBy: { enviadaEn: "desc" }` en `apps/web/src/server/api/routers/propuesta.ts` — FR-005, FR-010
- [x] T011 [US2] Sustituir la página provisional `apps/web/src/app/ponente/page.tsx` por «Mis propuestas»: aviso «Propuesta enviada» si `?enviada=1`, botón «Enviar propuesta», tabla con congreso, título, área, fecha de envío (zona del congreso) y estado con `Badge` (`ETIQUETA_ESTADO_PROPUESTA`); estado vacío «Todavía no has enviado ninguna propuesta» — US2-1, US2-5
- [x] T012 [US2] Ampliar la prueba e2e `apps/web/tests/e2e/001-enviar-propuesta.spec.ts`: `ponente1` ve propuestas en los estados «Enviada», «En evaluación», «Aceptada» y «Rechazada» y ninguna de `ponente2` (título «Cuidados centrados en el desarrollo en la UCI neonatal» no aparece); un ponente recién registrado ve «Todavía no has enviado ninguna propuesta» — US2-1, US2-2, US2-5

**Checkpoint**: US1 y US2 funcionales.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T013 Ejecutar la regresión completa (`pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e`) y registrar los resultados en este fichero
- [x] T014 Recorrer [quickstart.md](quickstart.md) y anotar el resultado observado de cada escenario en `specs/001-enviar-propuesta/informes/verificacion.md`, incluida la medición manual del tiempo para completar el formulario (SC-001 < 3 min)

---

## Notas de implementación (iteración 1, 2026-11-03)

- **T005/T010**: `propuesta.mias` se escribió en el mismo fichero que `enviar`, antes de T009; por tanto la prueba T009 no llegó a fallar antes de existir el código (desviación del orden TDD, documentada).
- **T004 (i)**: la primera versión comprobaba `api.propuesta.editar === undefined`, pero el *caller* de tRPC es un proxy que devuelve una función para cualquier nombre; se cambió a inspeccionar `appRouter._def.procedures`.
- **T008/T012**: 3 fallos en la primera ejecución, todos de la prueba: `selectOption` no admite expresiones regulares (se añadió `elegir()`), y el cambio de usuario sin borrar cookies continuaba antes de que terminara el nuevo inicio de sesión. Corregido; la aplicación no cambió.
- **SC-001**: medición humana pendiente (ver `informes/verificacion.md`).

### Resultados

| Comprobación | Resultado |
|--------------|-----------|
| Integración `tests/integration/001` | 14/14 ✔ (total apps/web 36/36) |
| E2E `tests/e2e/001-enviar-propuesta.spec.ts` | 5/5 ✔ (total 12/12) |
| `packages/domain` | 34/34 ✔ |
| lint · typecheck · build | sin errores |

## Dependencies & Execution Order

- T001 → T002 → T003 → (US1: T004 → T005 → T006 → T007 → T008) y (US2: T009 → T010 → T011 → T012) → T013 → T014
- US2 depende solo de la fase 2; T012 usa la página de T011. T008 y T012 editan el mismo fichero e2e: en serie.
- Depende de 000-core: `roleProcedure`, `ctx.ahora()`, `plazoEnvio`, `fecha`, `congreso.listar/porSlug`, seed.
- Lo que produce esta historia (propuestas `ENVIADA`) lo consume spec-002.

## Parallel Example

```text
Tras T003:  T004 (enviar.test.ts)  ∥  T009 (mias.test.ts)
```

## Implementation Strategy

1. Fases 1–2 (esquema y router).
2. US1 completa (MVP): un ponente ya puede enviar propuestas.
3. US2: seguimiento del estado.
4. Polish: regresión y verificación con evidencias.

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 | T002, T004a/d, T005, T007 |
| FR-002 (plazo, FR-005a) | T004b/c, T005 |
| FR-003 (área) | T004e, T005 |
| FR-004 (autor, estado, fecha) | T004a/j, T005 |
| FR-005 (solo las mías) | T009a/b, T010 |
| FR-006 (servidor) | T004, T009 (vía `createCaller`) |
| FR-007 (congresos abiertos) | T006 |
| FR-008 (inmutable, P1) | T004i |
| FR-009 (sin límite, P2) | T004h |
| FR-010 (privacidad, P3) | T009c, T010 |
| US1-1…6 | T004, T007, T008 |
| US2-1…5 | T009, T011, T012 (US2-4 = T004i, US2-5 = T011/T012) |
| SC-001 | T014 (manual) |
| SC-002, SC-003 | T004b, T011 |

## Phase 6: Convergence

- [ ] T015 Medir con una persona real (el responsable u otra) el tiempo desde abrir `/ponente/enviar` hasta ver «Propuesta enviada» con una propuesta válida y registrar el resultado (objetivo < 3 min) en `specs/001-enviar-propuesta/informes/verificacion.md` per SC-001 (partial)
