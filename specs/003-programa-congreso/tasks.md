---
description: "Lista de tareas de spec-003 (HU-03 Montar y publicar el programa)"
---

# Tasks: Montar y publicar el programa (HU-03)

**Input**: `/specs/003-programa-congreso/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/programa.md](contracts/programa.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución: pruebas de reglas e e2e).

**Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-003`

## Format: `[ID] [P?] [Story] Description`

- **[Story]**: US1 = programar sin solapes · US2 = modificar el programa · US3 = publicar con SEO

---

## Phase 1: Setup

- [x] T001 Comprobar la base en la rama `spec-003` (`pnpm test` en verde; seed con 4 ponencias aceptadas sin programar en `jornadas-pediatria-2027`, 2 de Pablo Ponente, y programa en borrador)

---

## Phase 2: Foundational

- [x] T002 [P] Pruebas de `instanteLocal("AAAA-MM-DDTHH:mm", zona)` (verano UTC+2, invierno UTC+1, formato inválido lanza error) en `packages/domain/tests/fechas.test.ts` — FR-014, clarify P2
- [x] T003 Implementar `instanteLocal` en `packages/domain/src/fechas.ts` reutilizando el cálculo de desfase de `inicioDeDia` hasta que T002 pase
- [x] T004 Crear esquemas zod en `apps/web/src/lib/esquemas/programa.ts`: `dia` con formato `AAAA-MM-DD`, `horaInicio`/`horaFin` con formato `HH:mm` (00–23 : 00–59) y mensajes en español; `horarioSchema`, `programarSchema` (`propuestaId`, `salaId` + horario) y `moverSchema` (`sesionId` + `salaId?` + horario opcional completo o ausente)
- [x] T005 Crear `programaRouter` vacío en `apps/web/src/server/api/routers/programa.ts`, registrarlo como `programa` en `apps/web/src/server/api/root.ts`, y el helper de pruebas `apps/web/tests/integration/003/fixtures.ts` (congreso con fechas fijas en Europe/Madrid, salas «Grande» aforo 100, «Media» 50 y «Pequeña» 1; dos autores; propuestas `ACEPTADA` y una `EN_EVALUACION`; organizador)

---

## Phase 3: User Story 1 - Programar ponencias aceptadas sin solapamientos (P1) 🎯 MVP

**Goal**: el organizador coloca ponencias aceptadas en sala y horario sin solapes de ponente ni de sala.

**Independent Test**: programar «Vacunación…» 10:00–10:30; «Alergias…» (mismo ponente) 10:15 → rechazo; 10:30 → aceptado.

### Tests for User Story 1 ⚠️

- [x] T006 [P] [US1] Prueba de integración `apps/web/tests/integration/003/programar.test.ts`: (a) US1-1 crea la sesión con las horas convertidas desde la zona del congreso (10:00 Madrid → UTC correcto) y la ponencia sale de `pendientes`; (b) US1-2 solape de ponente → `CONFLICT` con nombre del ponente, título y horas locales; (c) US1-3 solape de sala → `CONFLICT` con sala, título y horas; (d) US1-4 sesiones contiguas (fin = inicio) aceptadas, para ponente y para sala; (e) US1-5 propuesta `EN_EVALUACION` → `CONFLICT` «Solo se pueden programar ponencias aceptadas»; ya programada → «Esta ponencia ya está programada»; (f) US1-6 fin ≤ inicio (incluido el intento de cruzar la medianoche, clarify P3) y fuera de las fechas del congreso → `BAD_REQUEST` «La hora de fin debe ser posterior a la de inicio»; sala de otro congreso → `BAD_REQUEST`; (g) US1-7 no organizador → `FORBIDDEN`; (h) FR-012 congreso finalizado → `CONFLICT` «El congreso ha finalizado…»; (i) SC-001 dos `programar` simultáneos en la misma sala y hora → exactamente uno se crea

### Implementation for User Story 1

- [x] T007 [US1] Implementar `pendientes`, `sesiones` y `programar` en `apps/web/src/server/api/routers/programa.ts`: transacción con `SELECT … FROM "Congreso" WHERE id = $1 FOR UPDATE`, validaciones de contracts/programa.md, `instanteLocal` con la zona del congreso, `primerSolape` sobre sesiones de la misma sala o del mismo autor — FR-001…FR-005, FR-008, FR-011, FR-012, FR-014
- [x] T008 [US1] Página del organizador `apps/web/src/app/organizador/[slug]/programa/page.tsx` + `acciones.tsx`: lista «Pendientes de programar» con formulario por ponencia (sala, día —por defecto el primer día del congreso—, hora de inicio, hora de fin) y tabla de sesiones agrupadas por día (hora local, sala, título, ponente, reservas/aforo); errores del servidor en línea. Añadir enlace «Programa» por congreso en `apps/web/src/app/organizador/page.tsx` — US1-1…US1-6

**Checkpoint**: US1 funcional.

---

## Phase 4: User Story 2 - Modificar el programa (P2)

**Goal**: mover (sala u horario) y quitar sesiones con las mismas reglas, aforo y estados.

**Independent Test**: mover a una hora libre (aceptado) y a una que solapa con el mismo ponente (rechazado, sin cambios).

### Tests for User Story 2 ⚠️

- [x] T009 [P] [US2] Prueba de integración `apps/web/tests/integration/003/mover.test.ts`: (a) US2-1 mover a sala u horario libre; (b) US2-2 movimiento con solape de ponente o de sala → `CONFLICT` y la sesión conserva sala y horario; (c) US2-3 sala destino con aforo < reservas → `CONFLICT` «La sala … tiene aforo N y la sesión tiene M reservas»; (d) US2-4 quitar con reservas o asistencias → `CONFLICT`; sin ellas → se borra y la ponencia vuelve a `pendientes`; (e) US2-5/FR-013 sesión empezada (`ahora` dentro de la sesión): cambiar horario o quitar → `CONFLICT` «La sesión ya ha empezado: solo se puede cambiar de sala»; cambiar solo la sala → aceptado; (f) US2-6/FR-012 congreso finalizado: mover y quitar → `CONFLICT`; (g) mover sin cambiar nada no se compara consigo misma (no es solape); (h) no organizador → `FORBIDDEN`

### Implementation for User Story 2

- [x] T010 [US2] Implementar `mover` y `quitar` en `apps/web/src/server/api/routers/programa.ts` con el mismo bloqueo y validaciones, excluyendo la propia sesión al buscar solapes, contando `EntradaAgenda` (reservas) y `Asistencia` — FR-004…FR-007, FR-012, FR-013
- [x] T011 [US2] Acciones por sesión en `apps/web/src/app/organizador/[slug]/programa/acciones.tsx`: «Cambiar» (sala, día y horas; si la sesión ya empezó, solo sala) y «Quitar» con confirmación; errores en línea — US2-1…US2-5

**Checkpoint**: US1 y US2 funcionales.

---

## Phase 5: User Story 3 - Publicar el programa en la web, bien posicionado (P1)

**Goal**: publicar y servir el programa en páginas públicas SSR con metadatos, JSON-LD, sitemap y robots.

**Independent Test**: publicar y obtener con `fetch` (sin JavaScript) el HTML con sesiones, título, canonical y JSON-LD; aparece en `/sitemap.xml`.

### Tests for User Story 3 ⚠️

- [x] T012 [P] [US3] Prueba de integración `apps/web/tests/integration/003/publicar.test.ts`: (a) US3-1 `publicar` → `PUBLICADO` con `publicadoEn`; idempotente; no organizador → `FORBIDDEN`; (b) US3-2 `publico` en borrador → `{ publicado: false }` sin sesiones; (c) US3-1 `publico` publicado → sesiones agrupadas por día local y ordenadas por hora, con sala, título, área y ponente, y sin datos privados (correo del ponente, reservas); (d) US3-5 `sesionPublica` devuelve resumen, ponente, sala y horario; `NOT_FOUND` si el programa está en borrador o la sesión es de otro congreso; (e) funciona sin sesión (público)

### Implementation for User Story 3

- [x] T013 [US3] Implementar `publicar`, `publico` y `sesionPublica` en `apps/web/src/server/api/routers/programa.ts` — FR-001, FR-009, FR-010
- [x] T014 [US3] Botón «Publicar programa» y estado (Borrador / Publicado el {fecha}) con enlace a la página pública en `apps/web/src/app/organizador/[slug]/programa/page.tsx` — US3-1
- [x] T015 [US3] Página pública `apps/web/src/app/congresos/[slug]/programa/page.tsx` (`dynamic = "force-dynamic"`): aviso «El programa aún no se ha publicado» en borrador; si publicado, sesiones por día y hora con enlace a su detalle; «Sin sesiones todavía» si está vacío; `generateMetadata` con title, description, canonical y Open Graph; JSON-LD `Event` con `subEvent` desde `apps/web/src/lib/seo.ts`. Enlace «Ver programa» en `apps/web/src/app/congresos/[slug]/page.tsx` — US3-1, US3-2, US3-3, US3-4, FR-009, FR-010
- [x] T016 [US3] Página de detalle `apps/web/src/app/congresos/[slug]/programa/[sesionId]/page.tsx` con `generateMetadata` y JSON-LD `Event` de la sesión; `notFound()` si no procede — US3-5
- [x] T017 [P] [US3] `apps/web/src/app/sitemap.ts` (portada, congresos y, para los publicados, programa y cada sesión) y `apps/web/src/app/robots.ts` (permitir todo salvo `/organizador`, `/comite`, `/ponente`, `/area-personal`, `/acreditacion`, `/api`; enlace al sitemap) — FR-009

**Checkpoint**: HU-03 completa.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T018 Prueba e2e `apps/web/tests/e2e/003-programa.spec.ts`: organizador programa «Vacunación…» (US1-1), solape de ponente con «Alergias…» (US1-2), contigua aceptada (US1-4); visitante ve «El programa aún no se ha publicado» (US3-2); organizador publica (US3-1); `request.get` del HTML sin JavaScript contiene la sesión, `<link rel="canonical">` y `application/ld+json` (SC-003); `/sitemap.xml` contiene la URL del programa y `/robots.txt` bloquea `/organizador`; detalle de sesión accesible (US3-5); `asistente1` en `/organizador/…/programa` → «Acceso denegado» (US1-7)
- [x] T019 Ejecutar Lighthouse (categoría SEO) con el Chromium preinstalado contra la página pública publicada y registrar la puntuación (SC-002 ≥ 90) en `specs/003-programa-congreso/informes/verificacion.md`
- [x] T020 Regresión completa (`pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e`) y resultados en este fichero; recorrer [quickstart.md](quickstart.md) y registrar lo observado en `informes/verificacion.md`, incluida SC-004 (programar en < 1 min) como medición manual pendiente si no la hace el responsable

---

## Notas de implementación (iteración 1, 2026-11-03)

- **T003**: la primera versión de `instanteLocal` usaba una fórmula de corrección poco legible; se reescribió con el mismo patrón de dos pasadas que `inicioDeDia` (pruebas en verde antes y después).
- **T018**: `tests/e2e/global-setup.ts` (recarga del seed) se trajo de la rama `spec-002` con contenido idéntico para que la integración en `main` no genere conflicto.
- **T019**: Lighthouse 12 vía `npx` con el Chromium preinstalado: SEO 100, accesibilidad 100 (informe en `informes/lighthouse.json`).
- **Entorno**: `ss` no está instalado; para parar servidores de prueba se buscó el proceso en `/proc`.
- **SC-004**: medición humana pendiente.

### Resultados

| Comprobación | Resultado |
|--------------|-----------|
| `packages/domain` | 38/38 ✔ (4 nuevas de `instanteLocal`) |
| Integración `tests/integration/003` | 22/22 ✔ (total 44/44) |
| E2E `tests/e2e/003-programa.spec.ts` | 5/5 ✔ (total 12/12) |
| Lighthouse SEO / accesibilidad | 100 / 100 |
| lint · typecheck · build | sin errores |

## Dependencies & Execution Order

- T001 → T002 → T003 → T004 → T005 → US1 (T006 → T007 → T008) → US2 (T009 → T010 → T011) → US3 (T012 → T013 → T014 → T015 → T016; T017 en paralelo) → T018 → T019 → T020
- T007, T010 y T013 editan el mismo router: en serie. T008, T011 y T014 editan la misma pantalla: en serie.
- Consume ponencias `ACEPTADA` (spec-002 / seed). Produce sesiones que usan spec-005 (agenda), spec-006 (acceso) y spec-008 (panel, que reutiliza `programa.mover` para cambiar de sala).
- Coordinación con `spec-002` al integrar en `main`: `app/organizador/page.tsx` y `server/api/root.ts`.

## Parallel Example

```text
Tras T005:  T006 (programar.test) ∥ T009 (mover.test) ∥ T012 (publicar.test)
Durante US3: T017 (sitemap/robots) ∥ T015/T016
```

## Implementation Strategy

US1 (MVP: montar el programa) → US2 (ajustes) → US3 (publicación y SEO) → e2e, Lighthouse y verificación.

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (solo organizador) | T006g, T009h, T012a, T007, T010, T013 |
| FR-002 (solo aceptadas, una vez) | T006e, T007 |
| FR-003 (sala del congreso, inicio < fin, mismo día, dentro de fechas) | T006f, T007 |
| FR-004 (solape de ponente) | T006b/d, T009b, T007, T010 |
| FR-005 (solape de sala) | T006c/d, T009b, T007, T010 |
| FR-006 (aforo ≥ reservas al mover) | T009c, T010 |
| FR-007 (no quitar con reservas/asistencias) | T009d, T010 |
| FR-008 (mensaje identifica la sesión) | T006b/c |
| FR-009 (SSR, SEO, sitemap, robots) | T015, T016, T017, T018, T019 |
| FR-010 (borrador sin sesiones) | T012b, T015, T018 |
| FR-011 (servidor) | T006, T009, T012 (`createCaller`) |
| FR-012 (congreso finalizado) | T006h, T009f |
| FR-013 (sesión empezada: solo sala) | T009e, T011 |
| FR-014 (zona del congreso) | T002, T003, T006a |
| US1-1…7 | T006, T008, T018 |
| US2-1…6 | T009, T011 |
| US3-1…5 | T012, T014–T016, T018 |
| SC-001 / SC-002 / SC-003 / SC-004 | T006i / T019 / T018 / T020 |

## Phase 7: Convergence

- [x] T021 Documentar en `specs/003-programa-congreso/plan.md` (decisión 7) las dos protecciones SEO que el código añade sin estar previstas —`noindex` de la página pública mientras el programa está en borrador (`apps/web/src/app/congresos/[slug]/programa/page.tsx`) y `Disallow: /entrar` y `/registro` en `apps/web/src/app/robots.ts`— y su motivo, o retirarlas per plan: decisión 7 (unrequested)
- [ ] T022 Medir con una persona real el tiempo para programar una ponencia desde `/organizador/[slug]/programa` (objetivo < 1 min) y registrarlo en `specs/003-programa-congreso/informes/verificacion.md` per SC-004 (partial) · **2026-11-04**: estimación KLM registrada en `verificacion.md` ([informe](../000-core/informes/estimacion-klm.md)); sigue abierta hasta la medición real
