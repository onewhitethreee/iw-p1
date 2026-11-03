# Implementation Plan: Enviar propuesta de ponencia (HU-01)

**Branch**: `spec-001` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Input**: Feature specification from `/specs/001-enviar-propuesta/spec.md`

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El ponente elige un congreso con la llamada abierta, rellena título, resumen y área temática y envía la propuesta;
después consulta «Mis propuestas» con su estado. Técnicamente: router tRPC `propuesta` (`enviar`, `mias`) que aplica en
el servidor el plazo de días completos (`plazoEnvio` + FR-005a), la pertenencia del área al congreso y el rol `PONENTE`;
un esquema zod compartido entre formulario y servidor; y dos pantallas bajo `/ponente`. No se añaden entidades ni
migraciones: se usan `Propuesta`, `AreaTematica` y `Congreso` de 000-core.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 (heredado de 000-core)

**Primary Dependencies**: Next.js 15 · tRPC 11 · Prisma 6 · zod · react-hook-form + `@hookform/resolvers` (formulario largo, research R11 de 000-core) · shadcn/ui

**Storage**: PostgreSQL 16, tabla `Propuesta` existente (sin migración nueva)

**Testing**: Vitest (integración del router con `createCaller` e instante simulado `ahora`) · Playwright (recorrido del ponente)

**Target Platform**: navegador de escritorio y móvil

**Project Type**: aplicación web (monorepo de 000-core)

**Performance Goals**: envío y listado < 1 s; SC-001: formulario completo en < 3 min

**Constraints**: reglas en el servidor (Constitución IV); plazo como días completos en la zona del congreso (000-core FR-005a); la respuesta de `mias` no incluye datos de evaluación (FR-010)

**Scale/Scope**: cientos de propuestas por congreso; 2 pantallas, 2 procedimientos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Reutiliza `congreso.listar`/`porSlug` para elegir congreso y área; solo 2 procedimientos nuevos | ✅ |
| II. Cero alcance fantasma | Sin edición, retirada ni límite de propuestas (clarify P1, P2) | ✅ |
| III. Verificable sin leer código | Escenarios Dado/Cuando/Entonces con habitual, error (plazo, datos) y permisos (rol) → [quickstart.md](quickstart.md) | ✅ |
| IV. Reglas en el servidor | Plazo, área y rol validados en `propuesta.enviar`; pruebas con `createCaller` | ✅ |
| V. Base común | Sin entidades nuevas; router `propuesta` ya previsto en el contrato de 000-core | ✅ |
| VI. Español y euro | Mensajes y fechas en español y en la zona del congreso | ✅ |
| VII. Datos personales | El autor se toma de la sesión; `mias` solo devuelve campos permitidos (FR-010) | ✅ |

**Re-check tras el diseño**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-enviar-propuesta/
├── spec.md
├── plan.md              # Este fichero
├── research.md
├── data-model.md        # Referencias a 000-core (sin entidades nuevas)
├── quickstart.md
├── contracts/
│   └── propuesta.md     # Router tRPC `propuesta`
├── checklists/requirements.md
├── informes/            # Evidencias clarify / analyze / converge
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
packages/domain/src/
└── congreso.ts                      # plazoEnvio() (ya existe) — se reutiliza
apps/web/src/
├── lib/esquemas/propuesta.ts        # zod compartido cliente/servidor (FR-001)
├── server/api/routers/propuesta.ts  # enviar, mias
├── server/api/root.ts               # registra `propuesta`
└── app/ponente/
    ├── page.tsx                     # «Mis propuestas» (US2)
    └── enviar/
        ├── page.tsx                 # carga congresos con llamada abierta
        └── formulario.tsx           # react-hook-form + zod (US1)
apps/web/tests/
├── integration/001/propuesta.test.ts
└── e2e/001-enviar-propuesta.spec.ts
```

**Structure Decision**: se sigue la estructura de 000-core; el trabajo de la historia queda en `routers/propuesta.ts`,
`app/ponente/` y sus pruebas en carpetas `001`.

## Decisiones de diseño

1. **Congresos y áreas**: el formulario usa `congreso.listar` (filtra fase `LLAMADA_ABIERTA`) y `congreso.porSlug` (áreas); no hace falta un procedimiento nuevo (R1).
2. **Plazo**: `propuesta.enviar` llama a `plazoEnvio(congreso, ctx.ahora())`; como `envioCierra` se guarda como las 00:00 del día siguiente (000-core data-model), el día de cierre completo queda incluido (FR-002).
3. **Autor**: siempre `ctx.usuario.id`; la entrada no acepta `autorId` (evita suplantación).
4. **Respuesta de `mias`**: `select` explícito de los campos de FR-010; nunca `include` de asignaciones o evaluaciones (R3).
5. **Inmutabilidad (P1)**: el router no expone ninguna mutación de edición o retirada; una prueba lo comprueba.
6. **Doble clic**: el botón se desactiva mientras la mutación está pendiente; sin regla de unicidad (spec, Edge Cases).

## Complexity Tracking

Sin violaciones que justificar.
