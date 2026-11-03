# Implementation Plan: Construir mi agenda personal (HU-05)

**Branch**: `spec-005` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Input**: Feature specification from `/specs/005-agenda-personal/spec.md`

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El asistente con inscripción confirmada añade sesiones del programa publicado a su agenda, reservando plaza; el sistema
rechaza solapes (A7), sesiones completas (A6), sesiones empezadas y duplicados, también ante peticiones simultáneas.
Puede quitar sesiones que no han empezado. Si un cambio del programa crea solapes en su agenda, se conservan con aviso
(clarify P1). Técnicamente: router tRPC `agenda` (5 procedimientos) con transacción que bloquea la inscripción y la
sesión (`FOR UPDATE`) antes de contar reservas; páginas `/area-personal/agenda` y `/area-personal/agenda/[slug]`.
Sin entidades ni migraciones nuevas.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 · **Primary Dependencies**: Next.js 15 · tRPC 11 · Prisma 6 · zod · shadcn/ui
**Storage**: PostgreSQL 16 (`EntradaAgenda` única por `(inscripcionId, sesionId)`) · **Testing**: Vitest (`createCaller`, `ahora` simulado, concurrencia) · Playwright
**Project Type**: aplicación web (monorepo de 000-core) · **Performance Goals**: añadir/quitar < 1 s · **Constraints**: SC-002 0 sesiones con más reservas que aforo con 20 peticiones simultáneas; reglas en el servidor
**Scale/Scope**: cientos de sesiones, más de mil asistentes; 2 pantallas, 5 procedimientos

## Constitution Check

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Sin lista de espera; aviso de solapes calculado al leer (no se guarda) | ✅ |
| II. Cero alcance fantasma | Solo añadir, quitar y consultar | ✅ |
| III. Verificable | Habitual (añadir), error (solape, completa, duplicada) y permisos/estado (sin confirmar, empezada, borrador) | ✅ |
| IV. Reglas en el servidor | Todas en `agenda.*` con bloqueo; pruebas con `createCaller` | ✅ |
| V. Base común | Entidades de 000-core; `solapa`/`primerSolape` del dominio; contrato de 000-core **actualizado** en este plan (`agenda.congresos`, aviso de solape) | ✅ |
| VI. Español | Horas en la zona del congreso | ✅ |
| VII. Datos personales | Solo se ven las reservas propias; de las demás, solo el número de plazas libres | ✅ |

## Project Structure

```text
apps/web/src/
├── server/api/routers/agenda.ts             # congresos, sesiones, anadir, quitar, mia
├── server/api/root.ts                       # registra `agenda`
├── app/area-personal/agenda/page.tsx        # congresos con inscripción confirmada
└── app/area-personal/agenda/[slug]/         # page.tsx + acciones.tsx (agenda + programa con «Añadir»)
apps/web/tests/
├── integration/005/{anadir,quitar}.test.ts
└── e2e/005-agenda.spec.ts
```

**Structure Decision**: la de 000-core. **Integración en `main`**: enlazar «Mi agenda» desde `app/area-personal/page.tsx` (lo reescribe spec-004) y registrar el router en `root.ts`.

## Decisiones de diseño

1. **Orden de bloqueo** (R1): `SELECT … FROM "Inscripcion" … FOR UPDATE` y después `SELECT … FROM "Sesion" … FOR UPDATE`; serializa a la vez las reservas de la misma persona (solapes) y las de la misma sesión (aforo). Siempre en ese orden para evitar interbloqueos.
2. **Validación** (R2), en este orden: inscripción confirmada en el congreso → programa publicado → sesión no empezada → no duplicada → sin solape con la agenda (`primerSolape`) → reservas < aforo.
3. **Aviso de solapes** (R3, clarify P1): `mia` calcula para cada entrada los títulos con los que se solapa (pares con `solapa`).
4. **Quitar** (R4): solo entradas propias de sesiones no empezadas; borra la fila y libera la plaza.
5. **Plazas libres** (R5): `sala.aforo − count(EntradaAgenda)`; nunca negativo en pantalla.
6. **Dónde se añade** (analyze U1, SC-003): el clic único «Añadir» está en la sección «Programa» de `/area-personal/agenda/[slug]`. La página pública del programa (spec-003) no cambia: es pública y no conoce al usuario.
