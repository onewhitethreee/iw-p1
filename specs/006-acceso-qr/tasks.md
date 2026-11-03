---
description: "Lista de tareas de spec-006 (HU-06 Controlar el acceso a la sala con QR)"
---

# Tasks: Controlar el acceso a la sala con QR (HU-06)

**Input**: `/specs/006-acceso-qr/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/acreditacion.md](contracts/acreditacion.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución). **Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-006`

- **[Story]**: US1 = escanear y admitir o rechazar · US2 = ocupación en la puerta

## Phase 1: Setup

- [ ] T001 Comprobar la base en `spec-006` (`pnpm test` verde; seed con «Rúbricas compartidas…» en Aula 3 con 2/2 asistencias) e instalar `html5-qrcode` en `apps/web/package.json`

## Phase 2: Foundational

- [ ] T002 Router vacío `acreditacionRouter` en `apps/web/src/server/api/routers/acreditacion.ts`, registrado como `acreditacion` en `apps/web/src/server/api/root.ts`; fixtures `apps/web/tests/integration/006/fixtures.ts` (congreso con sesión en sala de aforo 1 y otra de aforo 100, inscripciones confirmada/pendiente, otra de otro congreso, usuario ACREDITACION, `ahora` simulable)

## Phase 3: User Story 1 - Escanear y admitir o rechazar (P1) 🎯 MVP

**Independent Test**: código de `asistente3` → «Admitido»; repetir → «Ya registrado»; inventado → «Acreditación no válida».

- [ ] T003 [P] [US1] Prueba de integración `apps/web/tests/integration/006/escanear.test.ts`: (a) US1-1 admite, crea `Asistencia` con `registradaPorId` y devuelve nombre y ocupación; (b) US1-2 aforo completo → `RECHAZADO` «Aforo completo» sin crear asistencia; (c) US1-3 código desconocido → «Acreditación no válida»; (d) US1-4 pendiente → «Inscripción no confirmada»; otro congreso → «Acreditación de otro congreso»; (e) US1-5 segundo escaneo → `YA_REGISTRADO` sin nueva asistencia ni consumir aforo, también con la sala llena; (f) US1-6 sin rol ACREDITACION → `FORBIDDEN`; (g) FR-010 31 min antes → «La sesión aún no está abierta (se abre a las HH:mm)»; 30 min antes → admitido; en el fin → «La sesión ya ha terminado»; (h) FR-009 sin la sesión en la agenda → admitido si quedan plazas sin reservar; (h2) clarify P3: sala de aforo 2 con 1 reserva y 1 asistente sin reserva ya dentro → otro sin reserva «No quedan plazas sin reservar», el que reservó → admitido; (i) SC-002 10 escaneos simultáneos de asistentes distintos con 1 plaza → 1 admitido; (j) el código se acepta con espacios alrededor
- [ ] T004 [US1] Implementar `sesiones` y `escanear` en `apps/web/src/server/api/routers/acreditacion.ts` (orden de comprobación del plan R2, `FOR UPDATE` sobre la sesión, `registradaPorId = ctx.usuario.id`) — FR-001…FR-006, FR-008…FR-010
- [ ] T005 [US1] Páginas `apps/web/src/app/acreditacion/page.tsx` (congresos), `apps/web/src/app/acreditacion/[slug]/page.tsx` (sesiones con «Abierta ahora»/horario) y `apps/web/src/app/acreditacion/[slug]/[sesionId]/page.tsx` + `escaner.tsx`: lector `html5-qrcode` (cámara trasera; pausa de 2 s tras cada lectura), campo «Código de acreditación» + «Validar», resultado grande en verde/ámbar/rojo con motivo y nombre — US1-1…US1-7, FR-002, FR-006

## Phase 4: User Story 2 - Ocupación en la puerta (P2)

**Independent Test**: admitir a dos personas y ver el contador +2 en pocos segundos (también en otra puerta).

- [ ] T006 [P] [US2] Prueba de integración en `apps/web/tests/integration/006/escanear.test.ts` (bloque «ocupacion»): `ocupacion` refleja asistencias/aforo tras admisiones hechas por otra puerta (otro usuario ACREDITACION); sin rol → `FORBIDDEN`
- [ ] T007 [US2] Implementar `ocupacion` en `apps/web/src/server/api/routers/acreditacion.ts` y el contador «N / aforo · quedan M» en `escaner.tsx` con `refetchInterval: 3000` — US2-1, FR-007

## Phase 5: Polish

- [ ] T008 E2E `apps/web/tests/e2e/006-acceso.spec.ts` (entrada manual del código, sin cámara): admitido (US1-1, contador +1), ya registrado (US1-5), aforo completo en «Rúbricas compartidas…» (US1-2), código inventado (US1-3), `asistente1` en `/acreditacion` → acceso denegado (US1-6)
- [ ] T009 Regresión completa y resultados en este fichero; [quickstart.md](quickstart.md) y `informes/verificacion.md` (SC-001 < 1 s medido en las pruebas)

## Dependencies & Execution Order

T001 → T002 → US1 (T003 → T004 → T005) → US2 (T006 → T007) → T008 → T009. T004/T007 mismo router; T005/T007 misma pantalla. Consume acreditaciones confirmadas (spec-004) y sesiones (spec-003) vía seed; produce las asistencias que usan spec-007 (80 %) y spec-008 (ocupación real).

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (rol) | T003f, T006, T004 |
| FR-002 (elegir sesión; manual) | T005, T008 |
| FR-003 (condiciones de admisión) | T003a–d,g, T004 |
| FR-004 (registrar asistencia) | T003a, T004 |
| FR-005 (ya registrado) | T003e, T004 |
| FR-006 (motivo) | T003b–d,g, T005 |
| FR-007 (ocupación visible) | T006, T007 |
| FR-008 (concurrencia) | T003i, T004 |
| FR-009 (sin agenda, P1) | T003h |
| FR-010 (ventana, P2) | T003g |
| US1-1…7 / US2-1 | T003–T008 |
| SC-001 / SC-002 / SC-003 | T009 / T003i / T003c,d |
