# Implementation Plan: Montar y publicar el programa (HU-03)

**Branch**: `spec-003` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Input**: Feature specification from `/specs/003-programa-congreso/spec.md`

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El organizador coloca cada ponencia aceptada en una sala y un horario, lo modifica con las mismas reglas y publica el
programa; cualquier visitante lo consulta en páginas públicas renderizadas en el servidor y preparadas para buscadores.
Técnicamente: router tRPC `programa` (8 procedimientos) que valida en una transacción —con la fila del congreso bloqueada—
solape de ponente y de sala (`primerSolape`, A7), fechas del congreso, estado del congreso/sesión (clarify P1) y aforo
frente a reservas; las horas llegan como texto local y el servidor las convierte con la zona del congreso (clarify P2,
helper `instanteLocal` en `packages/domain`). Páginas públicas `/congresos/[slug]/programa` y `/…/programa/[sesionId]`
con `generateMetadata`, JSON-LD `Event`, `sitemap.ts` y `robots.ts`. Sin entidades ni migraciones nuevas.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 (000-core)

**Primary Dependencies**: Next.js 15 (Server Components, `generateMetadata`, `MetadataRoute`) · tRPC 11 · Prisma 6 · zod · shadcn/ui

**Storage**: PostgreSQL 16; tablas `Sesion`, `Sala`, `Propuesta`, `Congreso`, `EntradaAgenda`, `Asistencia` existentes

**Testing**: Vitest (dominio: `instanteLocal`; integración con `createCaller` e instante `ahora` simulado) · Playwright (organizador y visitante; comprobación del HTML sin JavaScript)

**Target Platform**: navegador de escritorio (organizador); cualquier navegador y rastreadores (público)

**Project Type**: aplicación web (monorepo de 000-core)

**Performance Goals**: SC-004 programar en < 1 min; página pública < 1 s con 50 sesiones; SC-002 Lighthouse SEO ≥ 90

**Constraints**: 0 solapes incluso con peticiones simultáneas (SC-001); HTML inicial completo sin JavaScript (SC-003); reglas en el servidor

**Scale/Scope**: decenas de salas y cientos de sesiones por congreso; 3 pantallas, 8 procedimientos, 2 rutas SEO

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Páginas públicas con renderizado dinámico en servidor (sin caché ni revalidación); una sesión = una ponencia | ✅ |
| II. Cero alcance fantasma | Sin despublicar ni notificaciones (Assumptions); sin gestión de salas | ✅ |
| III. Verificable | Escenarios con habitual, error (solapes, fechas, aforo) y permisos/estado (rol, finalizado, empezada) | ✅ |
| IV. Reglas en el servidor | Todas en `programa.*` dentro de una transacción con bloqueo; pruebas con `createCaller` | ✅ |
| V. Base común | Entidades de 000-core; regla A7 de `packages/domain` | ✅ |
| VI. Español | Fechas y horas en la zona del congreso; mensajes con hora local | ✅ |
| VII. Datos personales | El programa público solo muestra el nombre del ponente (dato que la narrativa hace público) | ✅ |

**Re-check tras el diseño**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/003-programa-congreso/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/programa.md
├── checklists/requirements.md
├── informes/
└── tasks.md
```

### Source Code (repository root)

```text
packages/domain/src/fechas.ts                  # + instanteLocal("AAAA-MM-DDTHH:mm", zona) (clarify P2)
apps/web/src/
├── lib/esquemas/programa.ts                   # zod: fecha/hora local, salaId, propuestaId
├── server/api/routers/programa.ts             # 8 procedimientos (contracts/programa.md)
├── server/api/root.ts                         # registra `programa`
├── app/organizador/page.tsx                   # + enlace «Programa» por congreso
├── app/organizador/[slug]/programa/           # page.tsx + acciones.tsx (US1, US2, publicar)
├── app/congresos/[slug]/page.tsx              # + enlace «Ver programa»
├── app/congresos/[slug]/programa/page.tsx     # público SSR + SEO (US3)
├── app/congresos/[slug]/programa/[sesionId]/page.tsx  # detalle de sesión indexable
├── app/sitemap.ts · app/robots.ts             # FR-009
└── lib/seo.ts                                 # JSON-LD Event / subEvent
apps/web/tests/
├── integration/003/{programar,mover,publicar}.test.ts
└── e2e/003-programa.spec.ts
```

**Structure Decision**: la de 000-core. **Coordinación con spec-002**: `app/organizador/page.tsx` y `server/api/root.ts` también los modifica la rama `spec-002`; al integrar en `main` se combinarán ambos cambios (enlaces «Propuestas» y «Programa»; registro de ambos routers).

## Decisiones de diseño

1. **Bloqueo por congreso** (R1): `programar` y `mover` hacen `SELECT … FROM "Congreso" WHERE id = $1 FOR UPDATE` al empezar la transacción; así dos organizadores no pueden crear solapes simultáneos (SC-001).
2. **Solapes** (R2): se cargan las sesiones del congreso de la misma sala o del mismo autor (excluida la propia al mover) y se usa `primerSolape` (A7); el mensaje identifica la sesión en conflicto con su horario local (FR-008).
3. **Horas locales** (R3, clarify P2): la entrada es `{ dia: "AAAA-MM-DD", horaInicio: "HH:mm", horaFin: "HH:mm" }`; el servidor convierte con `instanteLocal` y la zona del congreso. Como inicio y fin comparten `dia`, una sesión no puede cruzar la medianoche (clarify P3): `horaFin ≤ horaInicio` se rechaza.
4. **Estados** (clarify P1): `ahora ≥ congreso.fin` → todo bloqueado; `sesion.inicio ≤ ahora` → `mover` solo admite `salaId` y `quitar` se rechaza.
5. **Aforo al mover** (FR-006): reservas = `count(EntradaAgenda)` de la sesión ≤ `sala.aforo` destino.
6. **Público dinámico** (R4): `export const dynamic = "force-dynamic"` en las páginas públicas → los cambios se ven en la siguiente visita (US3-4) y el HTML siempre se genera en el servidor (SC-003).
7. **SEO** (R5): `generateMetadata` (title, description, canonical, Open Graph), JSON-LD `Event` con `subEvent` por sesión y `location`; `sitemap.ts` con congresos publicados y sus sesiones; `robots.ts` permite todo salvo `/organizador`, `/comite`, `/ponente`, `/area-personal`, `/acreditacion`, `/api`.

## Complexity Tracking

Sin violaciones que justificar.
