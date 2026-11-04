# Implementation Plan: Inscribirse y pagar la entrada (HU-04)

**Branch**: `spec-004` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Input**: Feature specification from `/specs/004-inscripcion-pago/spec.md`

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El asistente elige su tipo de asistente, ve el precio vigente (temprano o general, A4 y 000-core FR-005a), crea la
inscripción `PENDIENTE_PAGO` con el importe fijado y la paga en una pasarela simulada (A5, clarify P3); al aprobarse
pasa a `CONFIRMADA` con un código de acreditación UUID v4 que se muestra como QR. Técnicamente: router tRPC
`inscripcion` (5 procedimientos, con `cancelar` de clarify-2 P4) que calcula siempre el importe en el servidor con `calcularTarifa`, bloquea la
inscripción al pagar (sin pagos dobles) y nunca guarda el número de tarjeta; páginas `/congresos/[slug]/inscripcion`
y `/area-personal` (+ pago). Sin entidades nuevas; una sola migración añade el valor `CANCELADA` al enum (decisión 8).

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 (000-core)

**Primary Dependencies**: Next.js 15 · tRPC 11 · Prisma 6 · zod · shadcn/ui · `qrcode` (generación del QR en el servidor, research R7 de 000-core)

**Storage**: PostgreSQL 16; tablas `Tarifa`, `Inscripcion`, `Pago` existentes; `Inscripcion (congresoId, usuarioId)` única y `codigoAcreditacion` única; valor `CANCELADA` añadido a `EstadoInscripcion` (migración `inscripcion_cancelada`, decisión 8)

**Testing**: Vitest (integración con `createCaller` e instante `ahora` simulado) · Playwright (inscribirse, pago rechazado y aprobado, QR)

**Target Platform**: navegador de escritorio y móvil (el QR se muestra en el móvil)

**Project Type**: aplicación web (monorepo de 000-core)

**Performance Goals**: SC-001 inscripción + pago en < 3 min; operaciones < 1 s

**Constraints**: importe calculado en el servidor (US1-6); sin pagos dobles (Edge Case); sin datos bancarios guardados (Constitución VII)

**Scale/Scope**: más de mil inscripciones por congreso; 3 pantallas, 5 procedimientos (`cancelar`, clarify-2 P4)

## Constitution Check

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Pasarela simulada propia; sin reembolsos. La cancelación de pendientes (clarify-2 P4) reutiliza la misma fila, sin índices parciales ni cambios en otras specs (R7) | ✅ |
| II. Cero alcance fantasma | Sin facturas ni correos; sin validar la condición de socio | ✅ |
| III. Verificable | Habitual (inscribirse/pagar), error (pago rechazado, tarjeta inválida, doble inscripción) y permisos/estado (ajena, ya confirmada, finalizado) | ✅ |
| IV. Reglas en el servidor | Tarifa, unicidad, estado y propiedad comprobados en `inscripcion.*` | ✅ |
| V. Base común | Entidades y estados de 000-core (`CANCELADA` se añade primero en `000-core/data-model.md` y en su contrato); `calcularTarifa` de `packages/domain` | ✅ |
| VI. Español y euro | Importes con `euros()`; día límite temprano como día completo | ✅ |
| VII. Datos personales | Solo se guarda «SIM-xxxx-últimos 4 dígitos»; QR con UUID no adivinable | ✅ |

**Re-check tras el diseño**: sin violaciones.

## Project Structure

```text
specs/004-inscripcion-pago/  spec · plan · research · data-model · quickstart · contracts/inscripcion.md · informes/ · tasks.md

apps/web/src/
├── lib/esquemas/inscripcion.ts              # zod: tipoAsistente, tarjeta (16 dígitos con espacios opcionales)
├── server/api/routers/inscripcion.ts        # presupuesto, crear, pagar, mias
├── server/api/root.ts                       # registra `inscripcion`
├── server/qr.ts                             # codigo → data URL PNG (qrcode)
├── app/congresos/[slug]/inscripcion/        # page.tsx + formulario.tsx (US1)
├── app/congresos/[slug]/page.tsx            # + botón «Inscribirme»
├── app/area-personal/page.tsx               # mis inscripciones + QR (US2-1, US2-5); insignia «Cancelada»
├── app/area-personal/cancelar.tsx           # botón con confirmación en la tarjeta (decisión 9)
└── app/area-personal/pago/[inscripcionId]/  # page.tsx + formulario.tsx (pasarela simulada, US2)
apps/web/prisma/migrations/20261105110000_inscripcion_cancelada/  # ALTER TYPE … ADD VALUE 'CANCELADA'
apps/web/tests/
├── integration/004/{inscribir,pagar,cancelar}.test.ts
└── e2e/004-inscripcion.spec.ts
```

**Structure Decision**: la de 000-core. Coordinación al integrar en `main`: `server/api/root.ts` (registro de routers) y `app/congresos/[slug]/page.tsx` (enlace «Ver programa» de spec-003).

## Decisiones de diseño

1. **Importe en el servidor** (R1): `crear` recibe solo `{ congresoId, tipoAsistente }`; usa `calcularTarifa(tarifa, congreso.limiteTemprana, ahora)`; cualquier campo extra se descarta.
2. **Unicidad** (R2) *(revisada el 2026-11-05 tras clarify-2 P4)*: se **mantiene** la restricción única `(congresoId, usuarioId)`, así que un usuario tiene una sola fila por congreso. `crear` intenta crear; con `P2002` reactiva la fila **solo si está `CANCELADA`**, con un `updateMany({ where: { congresoId, usuarioId, estado: "CANCELADA" } })` atómico → `PENDIENTE_PAGO` con el tipo, la tarifa, el importe y `creadaEn` de hoy (R7). Si no había ninguna cancelada → `CONFLICT` «Ya tienes una inscripción en este congreso».
3. **Pago sin dobles** (R3): transacción con `SELECT … FROM "Inscripcion" WHERE id = $1 FOR UPDATE`; si está `CONFIRMADA` → `CONFLICT`; si está `CANCELADA` → `CONFLICT` «Esta inscripción está cancelada» (clarify-2 P4).
4. **Pasarela** (R4, clarify P3): número normalizado (sin espacios) de 16 dígitos; `4000000000000002` → `RECHAZADO`; el resto `APROBADO`. Referencia `SIM-<8 hex>-<últimos 4>`.
5. **Rechazo no es error** (R5): `pagar` devuelve `{ resultado: "RECHAZADO", mensaje }` (200) y registra el `Pago`; la inscripción sigue pendiente.
6. **QR** (R6): `qrcode.toDataURL(codigoAcreditacion)` en el servidor; solo para el propietario y solo si está confirmada.
7. **Rol** (000-core FR-003a): un usuario con sesión sin rol asistente ve «Añadirme como asistente» en la página de inscripción.
8. **Cancelar** (R7, FR-014, clarify-2 P4): `cancelar({ inscripcionId })` hace `updateMany({ where: { id, usuarioId: ctx.usuario.id, estado: "PENDIENTE_PAGO" }, data: { estado: "CANCELADA" } })`. Es atómico: si `pagar` tiene la fila bloqueada (`FOR UPDATE`), espera y después ya no la encuentra pendiente; si cancela primero, `pagar` la ve `CANCELADA`. Si no actualiza ninguna fila, se lee para dar el motivo: inexistente o ajena → `FORBIDDEN` «No puedes cancelar una inscripción de otra persona»; confirmada → `CONFLICT` «Una inscripción pagada no se puede cancelar»; ya cancelada → `CONFLICT` «Esta inscripción ya está cancelada». Los `Pago` no se tocan.
9. **Interfaz** (US2-5…7): en el área personal, las pendientes tienen «Cancelar inscripción», con una confirmación **en la propia tarjeta** (sin `window.confirm`) que avisa de que, al volver a inscribirse, se aplica el precio vigente ese día. Las canceladas muestran la insignia «Cancelada» y el enlace «Inscribirme de nuevo». La página de inscripción no trata una cancelada como «ya inscrito», y `/area-personal/pago/[id]` redirige al área personal si la inscripción no está pendiente.
