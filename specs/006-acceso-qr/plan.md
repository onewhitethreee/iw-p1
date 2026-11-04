# Implementation Plan: Controlar el acceso a la sala con QR (HU-06)

**Branch**: `spec-006` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El personal de acreditación elige congreso y sesión y escanea (cámara o código escrito) la acreditación del asistente;
el servidor admite, informa «Ya registrado» o rechaza con motivo, y registra la asistencia sin superar nunca el aforo
de la sala, también con varias puertas a la vez. Técnicamente: router tRPC `acreditacion` (3 procedimientos) con
transacción que bloquea la sesión (`FOR UPDATE`) antes de contar asistencias; página `/acreditacion/[slug]/[sesionId]`
con lector `html5-qrcode`, campo manual y ocupación refrescada cada 3 s. Sin entidades ni migraciones nuevas.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 · **Primary Dependencies**: Next.js 15 · tRPC 11 · Prisma 6 · zod · shadcn/ui · `html5-qrcode` (cámara del móvil, R7 de 000-core)
**Storage**: PostgreSQL 16 (`Asistencia` única por `(inscripcionId, sesionId)`) · **Testing**: Vitest (`createCaller`, `ahora` simulado, concurrencia) · Playwright (entrada manual del código)
**Target Platform**: navegador móvil del personal · **Performance Goals**: SC-001 respuesta < 1 s · **Constraints**: SC-002 0 sesiones con más asistencias que aforo; reglas en el servidor
**Scale/Scope**: decenas de puertas a la vez; 3 pantallas, 3 procedimientos

## Constitution Check

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Sin registro de salidas; el resultado es una respuesta normal, no un error | ✅ |
| II. Cero alcance fantasma | Sin modo sin conexión (Edge Cases) | ✅ |
| III. Verificable | Habitual (admitido), error (código inválido, aforo, fuera de ventana) y permisos/estado (rol, no confirmada, otro congreso, ya registrado) | ✅ |
| IV. Reglas en el servidor | Todo en `acreditacion.escanear` con bloqueo | ✅ |
| V. Base común | Entidades de 000-core; **contrato de 000-core actualizado** (`ocupacion`, salida de `escanear`) | ✅ |
| VI. Español | Mensajes y horas en la zona del congreso | ✅ |
| VII. Datos personales | La respuesta solo muestra el nombre del asistente admitido | ✅ |

## Project Structure

```text
apps/web/src/
├── server/api/routers/acreditacion.ts           # sesiones, escanear, ocupacion
├── server/api/root.ts                           # registra `acreditacion`
├── app/acreditacion/page.tsx                    # congresos en curso (o próximos)
├── app/acreditacion/[slug]/page.tsx             # elegir sesión
└── app/acreditacion/[slug]/[sesionId]/          # page.tsx + escaner.tsx (cámara + manual + resultado + ocupación)
apps/web/tests/integration/006/escanear.test.ts · apps/web/tests/e2e/006-acceso.spec.ts
```

## Decisiones de diseño

1. **Resultado de negocio, no error** (R1): `escanear` devuelve `{ resultado: ADMITIDO | YA_REGISTRADO | RECHAZADO, motivo, asistente?, ocupacion }`. Solo el rol incorrecto produce `FORBIDDEN`.
2. **Orden de comprobación** (R2, revisado tras analyze H1 y clarify P3): código existe → mismo congreso → inscripción confirmada → ventana `[inicio − 30 min, fin)` → ya registrado (no consume aforo) → **sin asistencia en otra sesión solapada** (A7, motivo «Ya registrado en «{título}» a esta hora», FR-011; revisado el 2026-11-05 tras clarify-3 P4) → aforo de la sala para todos (`asistencias < aforo`, motivo «Aforo completo», FR-003) → si no tiene reserva **y las reservas siguen vigentes** (`reservaVigente(sesion.inicio, ahora)` de `packages/domain`, spec-005 FR-010), además plazas sin reservar (`reservas + asistentesSinReserva < aforo`, motivo «No quedan plazas sin reservar», FR-009). Desde inicio + 10 min basta el aforo, para quien reservó y para quien no. *(Precisado en implement: con la sala llena el motivo es «Aforo completo» para todos.)*
3. **Concurrencia** (R3, *revisada el 2026-11-05*): `SELECT … FROM "Sesion" WHERE id = $1 FOR UPDATE` antes de contar; la unicidad `(inscripcionId, sesionId)` respalda «ya registrado». Para FR-011 se bloquea además la **inscripción** del código escaneado: dos puertas de sesiones distintas bloquean sesiones distintas, así que solo el bloqueo de la persona las serializa. **Orden: inscripción → sesión**, el mismo que `agenda.anadir` (spec-005 R1). Con el orden contrario, añadir una sesión a la agenda mientras se escanea en su puerta (las dos operaciones son posibles entre −30 min y el inicio) podría provocar un interbloqueo y abortar una de ellas. El código se busca primero sin bloqueo; si no existe, no hay nada que bloquear.
4. **Ocupación en la puerta** (R4): `ocupacion` consultada cada 3 s (TanStack Query `refetchInterval`), suficiente para «pocos segundos» (US2-1).
5. **Lector** (R5): `html5-qrcode` en el cliente; tras leer un código se pausa 2 s para no enviar el mismo varias veces; campo manual siempre visible (FR-002, US1-7).
6. **Listado de sesiones** (R6): `sesiones` devuelve las sesiones del congreso ordenadas con indicación de «abierta ahora»; el personal elige la de su puerta.
