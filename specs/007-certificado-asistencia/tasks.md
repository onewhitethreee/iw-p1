---
description: "Lista de tareas de spec-007 (HU-07 Descargar el certificado de asistencia)"
---

# Tasks: Descargar el certificado de asistencia (HU-07)

**Input**: `/specs/007-certificado-asistencia/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/certificado.md](contracts/certificado.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución). **Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-007`

- **[Story]**: US1 = ver el estado y descargar el certificado (única historia de la spec)

## Phase 1: Setup

- [ ] T001 Comprobar la base en `spec-007` (`pnpm test` verde; seed con «Simposio de Salud Digital 2026» finalizado: asistente1 4/5, asistente2 3/5, asistente3 agenda vacía) e instalar `pdf-lib` en `apps/web/package.json`

## Phase 2: Foundational

- [ ] T002 Prueba primero en `packages/domain/tests/certificado.test.ts` y después cambio en `packages/domain/src/certificado.ts`: `porcentajeAsistencia()` trunca a entero (`2/3 → 66`, `4/5 → 80`, `79,9 % → 79`, agenda vacía → 0) — clarify P2, FR-003, plan R5
- [ ] T003 Router vacío `certificadoRouter` en `apps/web/src/server/api/routers/certificado.ts`, registrado como `certificado` en `apps/web/src/server/api/root.ts`; fixtures `apps/web/tests/integration/007/fixtures.ts` (congreso finalizado con 5 sesiones de duraciones conocidas, asistente con agenda y asistencias configurables, `ahora` simulable)

## Phase 3: User Story 1 - Ver el estado y descargar el certificado (P1) 🎯 MVP

**Independent Test**: en el Simposio finalizado, `asistente1` (4/5) descarga el PDF; `asistente2` (3/5) ve el motivo y la URL directa responde 403.

- [ ] T004 [P] [US1] Prueba de integración `apps/web/tests/integration/007/estado.test.ts` de `certificado.estado` y `certificado.congresos`: (a) US1-1 4 de 5 con congreso finalizado → `DISPONIBLE`, «80 %», asistidas 4, total 5, horas = suma de las asistidas, `sesiones` con `asistida`; (b) US1-2 3 de 5 → `BAJO_UMBRAL` con el motivo «No disponible: has asistido al 60 % de las sesiones de tu agenda (3 de 5); se necesita al menos el 80 %»; (c) US1-4 congreso sin terminar → `NO_FINALIZADO` «Disponible cuando termine el congreso (fecha)» con porcentaje provisional; `ahora = fin` → disponible (FR-001 `ahora ≥ fin`); (d) US1-5 agenda vacía → `AGENDA_VACIA`; (e) US1-7 sin inscripción o `PENDIENTE_PAGO` → `SIN_INSCRIPCION`; (f) Edge: asistencia fuera de la agenda no cuenta en ningún lado; umbral exacto 4/5 sí y 7/9 (77 %) no; 2/3 se muestra «66 %»; (g) P1: un usuario con rol PONENTE titular de una inscripción confirmada obtiene su estado; un organizador sin inscripción → `SIN_INSCRIPCION` (nunca el de otro); sin sesión → `UNAUTHORIZED`; congreso inexistente → `NOT_FOUND`; (h) `congresos` lista solo los confirmados del usuario con `finalizado`
- [ ] T005 [P] [US1] Prueba de integración `apps/web/tests/integration/007/descarga.test.ts` de `respuestaCertificado(usuario, congresoId, ahora)` (lo que ejecuta el *route handler*, plan R6/analyze U1) y de `lineasCertificado()`: (a) US1-1 200 `application/pdf`, `Content-Disposition: attachment; filename="certificado-<slug>.pdf"`, PDF válido (`PDFDocument.load`) con título «Certificado de asistencia», generado en < 3 s (SC-002); (b) las líneas incluyen nombre, congreso, fechas, sede, las 4 sesiones asistidas (no la no asistida) y «Horas de formación: …»; (c) US1-3 3 de 5 → 403 con el motivo en texto; (d) US1-6 otra persona / organizador → 403; sin sesión → 401; (e) se puede descargar dos veces (Edge Cases)
- [ ] T006 [US1] Implementar `calcularCertificado(db, usuarioId, congresoId, ahora)` en `apps/web/src/server/certificado.ts` (orden de estados del plan R2, recuento R4, motivos del contrato con fecha en la zona del congreso) y `congresos`/`estado` en `apps/web/src/server/api/routers/certificado.ts` con `protectedProcedure` (sin rol, P1) — FR-001, FR-002, FR-003, FR-006
- [ ] T007 [US1] Implementar `lineasCertificado()` y `generarPdfCertificado()` con `pdf-lib` (Helvetica, A4, metadatos título/asunto) en `apps/web/src/server/pdf-certificado.ts` más `respuestaCertificado()` (401/403/404/200, `Cache-Control: no-store`, recalcula con `calcularCertificado`), y el *route handler* `apps/web/src/app/api/certificado/[congresoId]/route.ts` que solo lee el usuario y delega — FR-004, FR-005
- [ ] T008 [US1] Páginas `apps/web/src/app/area-personal/certificado/page.tsx` (congresos confirmados) y `apps/web/src/app/area-personal/certificado/[slug]/page.tsx` (porcentaje «N % (A de T sesiones)», motivo, sesiones de la agenda marcando asistidas, horas y botón «Descargar certificado» solo si está disponible); enlace «Certificado» en `apps/web/src/app/area-personal/page.tsx` — US1-1…US1-5, US1-7, FR-003

## Phase 4: Polish

- [ ] T009 E2E `apps/web/tests/e2e/007-certificado.spec.ts`: asistente1 ve «80 % (4 de 5 sesiones)» y descarga el PDF (evento `download`, nombre `certificado-simposio-salud-digital-2026.pdf`) (US1-1); asistente2 ve el motivo y no hay botón, y la URL directa da 403 (US1-2, US1-3); asistente3 «tu agenda no tiene sesiones» (US1-5); asistente1 en Innovación Educativa «Disponible cuando termine el congreso» (US1-4)
- [ ] T010 Regresión completa y resultados en este fichero; [quickstart.md](quickstart.md) e `informes/verificacion.md` (SC-002 medido)

## Dependencies & Execution Order

T001 → T002 → T003 → T004/T005 (en paralelo, fallan) → T006 → T007 → T008 → T009 → T010. Consume las agendas (spec-005) y asistencias (spec-006) vía el seed de 000-core. El área personal exige el rol ASISTENTE (000-core); la API solo exige sesión (P1).

## Parallel Example

T004 y T005 (ficheros distintos) se escriben a la vez antes de T006/T007.

## Implementation Strategy

Una sola historia (MVP = US1 completa): primero la regla de dominio (T002), después servidor con pruebas (T004–T007), interfaz (T008) y e2e (T009).

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (finalizado) | T004c, T006 |
| FR-002 (porcentaje ≥ 80 %) | T002, T004a,b,f, T006 |
| FR-003 (mostrar porcentaje y motivo) | T002, T004, T008 |
| FR-004 (PDF y contenido) | T005a,b, T007 |
| FR-005 (recomprobar; solo titular) | T005c,d, T007 |
| FR-006 (sin inscripción / agenda vacía) | T004d,e, T006 |
| Clarify P1 / P2 | T004g, T005d / T002, T004f |
| US1-1…US1-7 | T004–T009 |
| SC-001 / SC-002 / SC-003 | T004, T009 / T005a, T010 / T004a |
