---
description: "Lista de tareas de spec-004 (HU-04 Inscribirse y pagar la entrada)"
---

# Tasks: Inscribirse y pagar la entrada (HU-04)

**Input**: `/specs/004-inscripcion-pago/` · **Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/inscripcion.md](contracts/inscripcion.md), base [000-core](../000-core/tasks.md)

**Tests**: SÍ (Constitución). **Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Rama**: `spec-004`

- **[Story]**: US1 = inscribirme con la tarifa correcta · US2 = pagar y obtener la acreditación

## Phase 1: Setup

- [x] T001 Comprobar la base en `spec-004` (`pnpm test` en verde; seed con `asistente5` sin inscripción y `asistente4` pendiente en Innovación Educativa) e instalar `qrcode` y `@types/qrcode` en `apps/web/package.json`

## Phase 2: Foundational

- [x] T002 Esquemas zod en `apps/web/src/lib/esquemas/inscripcion.ts`: `crearInscripcionSchema` (`congresoId`, `tipoAsistente` ∈ `PROFESIONAL|SOCIO|ESTUDIANTE`, sin campo de importe) y `pagoSchema` (`inscripcionId`, `tarjeta` que, tras quitar espacios, tiene **exactamente 16 dígitos** — «El número de tarjeta debe tener 16 dígitos») — FR-002, FR-013
- [x] T003 Router vacío `inscripcionRouter` en `apps/web/src/server/api/routers/inscripcion.ts`, registrado como `inscripcion` en `apps/web/src/server/api/root.ts`; helper `apps/web/src/server/qr.ts` (`qrDataUrl(codigo)` con `qrcode.toDataURL`, corrección M); fixtures `apps/web/tests/integration/004/fixtures.ts` (congreso con tarifas 250/300, 180/220, 90/120 y día límite temprano en Europe/Madrid; asistente)

## Phase 3: User Story 1 - Inscribirme con la tarifa correcta (P1) 🎯 MVP

**Independent Test**: estudiante antes del día límite → 90,00 €; después → 120,00 €.

- [x] T004 [P] [US1] Prueba de integración `apps/web/tests/integration/004/inscribir.test.ts`: (a) US1-1 23:59 del día límite → `TEMPRANA` 9000 y estado `PENDIENTE_PAGO`; (b) US1-2 00:00 del día siguiente → `GENERAL` 12000; (c) US1-3 segunda inscripción en el mismo congreso → `CONFLICT` «Ya tienes una inscripción en este congreso»; (d) US1-4 congreso finalizado → `CONFLICT`; en curso → aceptada (P2); (e) US1-5 sin sesión → `UNAUTHORIZED`; US1-6 solo PONENTE → `FORBIDDEN` (tras añadirse el rol asistente, 000-core FR-003a, se acepta); (f) US1-7 un `importeCent` enviado se ignora; (g) `presupuesto` público devuelve los 3 tipos con la tarifa vigente; (h) FR-011/P1: el router solo expone `presupuesto`, `crear`, `pagar`, `mias` (sin cambiar ni cancelar)
- [x] T005 [US1] Implementar `presupuesto` (público) y `crear` (`roleProcedure("ASISTENTE")`, `calcularTarifa` con `ctx.ahora()`, `P2002` → `CONFLICT`, congreso finalizado → `CONFLICT`) en `apps/web/src/server/api/routers/inscripcion.ts` — FR-001…FR-005, FR-011, FR-012
- [x] T006 [US1] Página `apps/web/src/app/congresos/[slug]/inscripcion/page.tsx` + `formulario.tsx`: tabla de precios vigentes (temprano hasta el {día}), selector de tipo y botón «Inscribirme»; sin sesión → enlaces a entrar/registrarse con `desde`; con sesión sin rol asistente → botón «Añadirme como asistente» (000-core FR-003a); ya inscrito → enlace a «Área personal»; al crear → `/area-personal/pago/{id}`. Botón «Inscribirme» en `apps/web/src/app/congresos/[slug]/page.tsx` — US1-1…US1-7

## Phase 4: User Story 2 - Pagar y obtener la acreditación (P1)

**Independent Test**: tarjeta 4111… → confirmada con QR; 4000 0000 0000 0002 → sigue pendiente.

- [x] T007 [P] [US2] Prueba de integración `apps/web/tests/integration/004/pagar.test.ts`: (a) US2-1 aprobado → `CONFIRMADA`, `confirmadaEn`, `codigoAcreditacion` UUID v4, `Pago APROBADO` con el importe y referencia que termina en los 4 últimos dígitos; (b) US2-2 tarjeta 4000 0000 0000 0002 → `{ resultado: "RECHAZADO" }`, `Pago RECHAZADO`, sigue pendiente sin código; luego aprobado → confirmada; (c) US2-3 ya confirmada → `CONFLICT` «Esta inscripción ya está pagada»; (d) US2-4 inscripción ajena → `FORBIDDEN`; (e) tarjeta de 15 dígitos o con letras → `BAD_REQUEST` sin crear pago; (f) ningún `Pago` guarda el número completo; (g) dos pagos simultáneos → exactamente un `APROBADO`; (h) US2-5 `mias` devuelve QR solo para confirmadas y nunca datos de otros usuarios
- [x] T008 [US2] Implementar `pagar` (transacción con `SELECT … FROM "Inscripcion" WHERE id = $1 FOR UPDATE`) y `mias` (con `qrDataUrl` si está confirmada) en `apps/web/src/server/api/routers/inscripcion.ts` — FR-005…FR-009, FR-013
- [x] T009 [US2] Pasarela simulada `apps/web/src/app/area-personal/pago/[inscripcionId]/page.tsx` + `formulario.tsx`: congreso, tipo e importe; campo «Número de tarjeta» con ayuda («Tarjeta de prueba que se rechaza: 4000 0000 0000 0002»); botón «Pagar {importe}» desactivado mientras se procesa; resultado rechazado en `Alert`; aprobado → `/area-personal?pagada=1` — US2-1, US2-2
- [x] T010 [US2] Área personal `apps/web/src/app/area-personal/page.tsx`: mis inscripciones con congreso, tipo, tarifa, importe y estado; pendientes con «Pagar»; confirmadas con QR grande y su código («Muestra este QR en la entrada de cada sala»); aviso «Pago aprobado» si `?pagada=1`; vacío «No tienes inscripciones» — US2-1, US2-5

## Phase 5: Polish

- [x] T011 E2E `apps/web/tests/e2e/004-inscripcion.spec.ts`: `asistente5` se inscribe en Jornadas de Pediatría como estudiante (90,00 €, US1-1), paga con la tarjeta de rechazo (sigue «Pendiente de pago», US2-2) y con 4111… (confirmada y `img[alt="Código QR de acreditación"]` visible, US2-1); intento de reinscribirse lleva al área personal (US1-3); `ponente1` ve «Añadirme como asistente» (US1-6/FR-003a); visitante sin sesión ve los enlaces para entrar
- [x] T012 Regresión completa y resultados en este fichero; recorrer [quickstart.md](quickstart.md) y registrar lo observado en `specs/004-inscripcion-pago/informes/verificacion.md` (SC-001 medición humana pendiente si no la hace el responsable)

## Notas de implementación (iteración 1, 2026-11-03)

- Todas las pruebas de integración (16) fallaron antes del código y pasaron después sin cambios en las pruebas.
- **T011**: `global-setup.ts` copiado de `spec-002` (contenido idéntico) para recargar el seed en e2e.
- **SC-001**: medición humana pendiente.

| Comprobación | Resultado |
|--------------|-----------|
| Integración `tests/integration/004` | 16/16 ✔ (total 38/38) |
| E2E `tests/e2e/004-inscripcion.spec.ts` | 4/4 ✔ (total 11/11) |
| lint · typecheck · build | sin errores |

## Dependencies & Execution Order

T001 → T002 → T003 → US1 (T004 → T005 → T006) → US2 (T007 → T008 → T009 → T010) → T011 → T012. T005/T008 editan el mismo router (en serie). Produce inscripciones confirmadas y códigos QR que consumen spec-005, spec-006, spec-007 y spec-008. Coordinación con spec-003 en `app/congresos/[slug]/page.tsx` y `root.ts` al integrar.

## Parallel Example

```text
Tras T003:  T004 (inscribir.test) ∥ T007 (pagar.test)
```

## Trazabilidad

| Requisito / escenario | Tareas |
|-----------------------|--------|
| FR-001 (precio vigente visible) | T004g, T006 |
| FR-002 (importe en servidor, fijado) | T002, T004a/b/f, T005 |
| FR-003 (una por congreso) | T004c, T005 |
| FR-004 (rol ASISTENTE, no finalizado) | T004d/e, T005 |
| FR-005 (PENDIENTE_PAGO → CONFIRMADA solo con aprobado) | T004a, T007a/b, T008 |
| FR-006 (código único y QR) | T007a/h, T008, T010 |
| FR-007 (rechazo deja pendiente y reintento) | T007b, T009 |
| FR-008 (registro de intentos sin tarjeta) | T007a/b/f, T008 |
| FR-009 (solo propietario) | T007d/h, T008 |
| FR-010 (euros) | T006, T009, T010 |
| FR-011 (inmutable, P1) | T004h |
| FR-012 (en curso, P2) | T004d |
| FR-013 (pasarela, P3) | T002, T007e/f |
| US1-1…7 / US2-1…5 | T004–T011 |
| SC-001 / SC-002 / SC-003 | T012 / T007a,g / T004a,b |

## Phase 6: Convergence

- [ ] T013 Medir con una persona real el tiempo desde abrir `/congresos/[slug]/inscripcion` hasta ver el QR en el área personal (objetivo < 3 min) y registrarlo en `specs/004-inscripcion-pago/informes/verificacion.md` per SC-001 (partial) · **2026-11-04**: estimación KLM registrada en `verificacion.md` ([informe](../000-core/informes/estimacion-klm.md)); sigue abierta hasta la medición real

## Clarify sobre la versión funcional (2026-11-04) · pendiente de plan y analyze

Tareas que salen de `informes/clarify-2.md`. Se implementan después de revisar `plan.md` y de `/speckit-analyze`.

- [ ] T014 Cancelar una inscripción pendiente (FR-014, Clarifications P4): primero en `specs/000-core/data-model.md` y `prisma/schema.prisma` el estado `CANCELADA` y la unicidad solo para inscripciones no canceladas (índice parcial en la migración); después `inscripcion.cancelar` en `apps/web/src/server/api/routers/inscripcion.ts` (solo el titular, solo `PENDIENTE_PAGO`, con bloqueo frente a un pago simultáneo). Prueba primero en `apps/web/tests/integration/004/`: cancelar y volver a inscribirse; confirmada → rechazo sin cambios; otro usuario → rechazo; cancelar ∥ pagar → solo una gana (issue #6)
- [ ] T015 Botón «Cancelar inscripción» en el área personal para las inscripciones pendientes (US2-5), con e2e en `apps/web/tests/e2e/004-inscripcion.spec.ts` (US2-6) (issue #6)
