# Implementation Plan: Descargar el certificado de asistencia (HU-07)

**Branch**: `spec-007` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El asistente abre «Certificado» en su área personal, elige el congreso y ve su porcentaje de asistencia sobre las
sesiones de su agenda. Con el congreso finalizado y al menos el 80 %, descarga un PDF con su nombre, el congreso,
las fechas y la sede, las sesiones asistidas y las horas de formación. Técnicamente: una función de servidor
`calcularCertificado()` compartida por el router tRPC `certificado` (estado en pantalla) y el *route handler*
`GET /api/certificado/[congresoId]` (PDF con `pdf-lib`), que vuelve a comprobar todo. Sin entidades ni migraciones.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 · **Primary Dependencies**: Next.js 15 · tRPC 11 · Prisma 6 · zod · shadcn/ui · `pdf-lib` (R6 de 000-core)
**Storage**: PostgreSQL 16 (`EntradaAgenda`, `Asistencia`, `Inscripcion`, `Congreso.fin`) · **Testing**: Vitest (dominio; integración con `createCaller` y llamada directa al *route handler*) · Playwright (descarga)
**Target Platform**: navegador (área personal) · **Performance Goals**: SC-002 PDF < 3 s · **Constraints**: reglas en el servidor; solo el titular
**Scale/Scope**: 2 pantallas, 2 procedimientos y 1 *route handler*

## Constitution Check

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Sin firma digital ni envío por correo (Assumptions); PDF de una página con fuentes estándar | ✅ |
| II. Cero alcance fantasma | Nada fuera de FR-001…FR-006 | ✅ |
| III. Verificable | Habitual (80 % descarga), error (60 %, agenda vacía, no finalizado) y permisos/estado (otra persona, sin inscripción, petición directa) | ✅ |
| IV. Reglas en el servidor | La descarga recalcula con la misma función que la pantalla (FR-005) | ✅ |
| V. Base común | Reglas en `packages/domain/certificado.ts`; **contrato y plan de 000-core actualizados primero** (`certificado.congresos`, salida de `estado`, ruta, P2) | ✅ |
| VI. Español | Motivos, fechas y horas en español y en la zona del congreso | ✅ |
| VII. Datos personales | El certificado solo lo obtiene su titular (P1); el organizador tampoco | ✅ |

## Project Structure

```text
packages/domain/src/certificado.ts               # porcentajeAsistencia() → entero truncado (P2)
apps/web/src/
├── server/certificado.ts                        # calcularCertificado(db, usuarioId, congresoId, ahora)
├── server/pdf-certificado.ts                    # lineasCertificado() + generarPdfCertificado() con pdf-lib
├── server/api/routers/certificado.ts            # congresos, estado
├── server/api/root.ts                           # registra `certificado`
├── app/api/certificado/[congresoId]/route.ts    # GET → PDF o 401/403
├── app/area-personal/certificado/page.tsx       # mis congresos confirmados
└── app/area-personal/certificado/[slug]/page.tsx  # porcentaje, motivo, sesiones y «Descargar certificado»
apps/web/tests/integration/007/*.test.ts · apps/web/tests/e2e/007-certificado.spec.ts
```

## Decisiones de diseño

1. **Una sola función de cálculo** (R1): `calcularCertificado()` devuelve `{estado, disponible, motivo, porcentaje, asistidas, total, horas, sesiones}`; la usan el router y el *route handler* (FR-005, Constitución IV).
2. **Orden de estados** (R2): sin inscripción confirmada → `SIN_INSCRIPCION` · `ahora < fin` → `NO_FINALIZADO` (con porcentaje provisional, US1-4) · agenda vacía → `AGENDA_VACIA` · `!cumpleUmbral` → `BAJO_UMBRAL` · si no, `DISPONIBLE`.
3. **Titularidad por construcción** (R3, P1): la inscripción se busca por `(congresoId, ctx.usuario.id)`; no se acepta ningún identificador de inscripción ni de usuario, así que nadie puede pedir el certificado de otra persona. Sin comprobación de rol: basta con sesión iniciada.
4. **Recuento** (R4): `total` = entradas de agenda de la inscripción; `asistidas` = las de esas sesiones con `Asistencia`. Las asistencias fuera de agenda no cuentan (Edge Cases). Horas = `horasCertificadas()` de las asistidas.
5. **Porcentaje** (R5, P2): `porcentajeAsistencia()` pasa a truncar a entero (`floor(asistidas × 100 / total)`); la decisión sigue siendo `cumpleUmbral()` exacto.
6. **PDF** (R6): `pdf-lib` con Helvetica estándar (WinAnsi cubre tildes, ñ y «»); A4 vertical; `lineasCertificado()` es pura y se prueba aparte; el PDF lleva título y asunto en sus metadatos para comprobarlo en pruebas. Respuesta `Content-Disposition: attachment; filename="certificado-<slug>.pdf"`, `Cache-Control: no-store`.
7. **Pantallas** (R7): índice `/area-personal/certificado` con los congresos confirmados (enlazado desde el área personal); detalle con porcentaje «80 % (4 de 5 sesiones)», motivo si no está disponible, lista de sesiones de la agenda marcando asistidas y botón «Descargar certificado» (enlace al *route handler*) solo si está disponible.
