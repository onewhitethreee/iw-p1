# Implementation Plan: Evaluar propuestas de forma anónima (HU-02)

**Branch**: `spec-002` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Input**: Feature specification from `/specs/002-evaluar-propuestas/spec.md`

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

Tres actores sobre la misma propuesta: el **organizador** asigna evaluadores del comité y, con al menos dos
evaluaciones, acepta o rechaza; el **evaluador** ve solo sus asignaciones, sin datos del autor, y puntúa de 1 a 10 con
comentarios. Técnicamente: router tRPC `evaluacion` con siete procedimientos; las reglas de estado vienen de
`packages/domain/propuesta.ts` (`estadoTrasAsignar`, `puedeDecidir`); el anonimato se garantiza en el servidor con
consultas `select` dedicadas («vista anónima») que nunca leen `autorId` ni la relación `autor`, y con una prueba que
busca cualquier rastro del autor en todas las respuestas del comité. Sin entidades ni migraciones nuevas.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 (000-core)

**Primary Dependencies**: Next.js 15 · tRPC 11 · Prisma 6 · zod · react-hook-form (formulario de evaluación) · shadcn/ui

**Storage**: PostgreSQL 16; tablas `Propuesta`, `Asignacion`, `Evaluacion` existentes (CHECK `puntuacion BETWEEN 1 AND 10` ya en BD)

**Testing**: Vitest (integración con `createCaller`) · Playwright (recorridos evaluador y organizador)

**Target Platform**: navegador de escritorio

**Project Type**: aplicación web (monorepo de 000-core)

**Performance Goals**: listados < 1 s con cientos de propuestas; SC-003: evaluación en < 2 min

**Constraints**: anonimato verificable en el servidor (FR-005, SC-001); reglas en el servidor (Constitución IV); decisiones concurrentes sin doble transición

**Scale/Scope**: cientos de propuestas y decenas de evaluadores por congreso; 3 pantallas, 7 procedimientos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Asignación manual; sin quitar asignaciones (clarify P1); sin umbral (P2) | ✅ |
| II. Cero alcance fantasma | Solo lo que piden US1–US3; el ponente no ve comentarios (spec-001 P3) | ✅ |
| III. Verificable | Escenarios con habitual, error (puntuación, < 2 evaluaciones) y permisos/estado | ✅ |
| IV. Reglas en el servidor | Asignar, evaluar y decidir validados en `evaluacion.*`; pruebas con `createCaller` | ✅ |
| V. Base común | Entidades y estados de 000-core; reglas de `propuesta.ts` | ✅ |
| VI. Español | Mensajes y media con formato es-ES («7,5») | ✅ |
| VII. Datos personales | La autoría nunca llega al comité (vista anónima + prueba de rastro) | ✅ |

**Re-check tras el diseño**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/002-evaluar-propuestas/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/evaluacion.md
├── checklists/requirements.md
├── informes/
└── tasks.md
```

### Source Code (repository root)

```text
apps/web/src/
├── lib/esquemas/evaluacion.ts            # zod: puntuación 1–10, comentarios 10–2000
├── server/api/routers/evaluacion.ts      # 7 procedimientos (contracts/evaluacion.md)
├── server/api/root.ts                    # registra `evaluacion`
└── app/
    ├── comite/page.tsx                   # mis asignaciones (US1)
    ├── comite/evaluar/[asignacionId]/    # page.tsx + formulario.tsx (US1)
    ├── organizador/page.tsx              # lista de congresos → propuestas
    └── organizador/[slug]/propuestas/    # page.tsx + acciones.tsx (US2, US3)
apps/web/tests/
├── integration/002/{asignar,evaluar,decidir,anonimato}.test.ts
└── e2e/002-evaluar-propuestas.spec.ts
```

**Structure Decision**: la de 000-core; el trabajo de la historia queda en `routers/evaluacion.ts`, `app/comite/`,
`app/organizador/[slug]/propuestas/` y sus pruebas `002`.

## Decisiones de diseño

1. **Vista anónima** (R1): todas las consultas del comité usan un `select` constante `SELECT_ANONIMO` sin `autorId` ni `autor`; nunca `include`.
2. **Asignación ajena = FORBIDDEN** (R2): `detalle`/`evaluar` sobre una asignación que no es del usuario devuelven `FORBIDDEN` aunque no exista (no se revela si existe).
3. **Asignar en transacción** (R3): crear `Asignacion` y pasar `ENVIADA → EN_EVALUACION` con `estadoTrasAsignar` en la misma transacción; la unicidad `(propuestaId, evaluadorId)` de la BD respalda la regla «no dos veces».
4. **Decidir sin carreras** (R4): `updateMany({ where: { id, estado: "EN_EVALUACION" } })`; si actualiza 0 filas, otra decisión ganó → `CONFLICT`.
5. **Evaluar = upsert** sobre `asignacionId` (una por evaluador y propuesta, modificable hasta la decisión).
6. **Organizador ve al autor** (Edge Case): `resumenOrganizador` sí incluye nombre del autor.

## Complexity Tracking

Sin violaciones que justificar.
