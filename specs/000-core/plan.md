# Implementation Plan: Núcleo común de Congresalia (000-core)

**Branch**: `main` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Input**: Feature specification from `/specs/000-core/spec.md`

> Este plan y su [modelo de datos](data-model.md) son **compartidos** por spec-001 … spec-008. Los planes de cada
> historia solo añaden sus pantallas, procedimientos y pruebas; no redefinen la pila, la estructura ni las entidades.

## Summary

Base técnica única para las ocho historias: monorepo con una aplicación Next.js (App Router) que expone una API
tRPC sobre Prisma y PostgreSQL, con interfaz shadcn/ui. Incluye autenticación con roles, el esquema completo de
datos, las reglas de negocio compartidas en un paquete puro y probado (`packages/domain`), datos de ejemplo y el
entorno local con `docker-compose`. Decisiones razonadas en [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 22 LTS

**Primary Dependencies**: Next.js 15 (App Router, React 19) · tRPC v11 + TanStack Query v5 · Prisma 6 · Auth.js v5 (Credentials) · zod · shadcn/ui + Tailwind CSS v4 · react-hook-form · qrcode / html5-qrcode · pdf-lib · bcryptjs

**Storage**: PostgreSQL 16 (contenedor `docker-compose` en local)

**Testing**: Vitest (unitarias de `packages/domain` e integración de routers tRPC con `createCaller` contra una BD de pruebas) · Playwright (recorridos de extremo a extremo)

**Target Platform**: navegador moderno de escritorio y móvil (el personal de acreditación usa el móvil); servidor Node.js

**Project Type**: aplicación web full-stack (monorepo)

**Performance Goals**: congreso de 1.000+ asistentes y decenas de sesiones paralelas; operaciones habituales < 1 s; panel refrescado cada 5 s; escaneo QR con respuesta < 1 s

**Constraints**: reglas de negocio en el servidor (Constitución IV); páginas públicas renderizadas en servidor con SEO; español de España y euros; sin secretos en el código (`.env.example`)

**Scale/Scope**: 8–10 congresos al año; 8 historias de usuario; ~20 pantallas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Un solo despliegue Next.js; polling en lugar de WebSockets; pago simulado; sin gestión CRUD de congresos/salas (seed) | ✅ |
| II. Cero alcance fantasma | Cada router se corresponde con una spec; las capacidades sin spec (CRUD de congresos, correos) quedan fuera | ✅ |
| III. Verificable sin leer código | Cada spec tiene escenarios Dado/Cuando/Entonces con caso habitual, de error y de permisos; [quickstart.md](quickstart.md) los recorre | ✅ |
| IV. Reglas en el servidor | Reglas en `packages/domain`, invocadas desde procedimientos tRPC con control de rol; pruebas de integración con `createCaller` | ✅ |
| V. Base común en 000-core | Este plan + [data-model.md](data-model.md) + [contracts/](contracts/trpc-api.md) | ✅ |
| VI. Español y euro | `Intl` `es-ES`/`EUR`; zona horaria del congreso; textos en español | ✅ |
| VII. Datos personales | Solo nombre, correo y contraseña; la consulta del comité nunca selecciona `autorId`; secretos en `.env` | ✅ |

**Re-check tras el diseño (fase 1)**: sin violaciones; *Complexity Tracking* vacío.

## Project Structure

### Documentation (this feature)

```text
specs/000-core/
├── spec.md
├── plan.md              # Este fichero
├── research.md          # Decisiones técnicas R1–R12
├── data-model.md        # Modelo de datos compartido
├── quickstart.md        # Cómo levantar y validar la base
├── contracts/
│   └── trpc-api.md      # Routers y procedimientos de las 8 specs
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
apps/
└── web/                              # Next.js (App Router)
    ├── prisma/
    │   ├── schema.prisma             # Traducción literal de data-model.md
    │   ├── migrations/
    │   └── seed.ts                   # Datos de ejemplo (FR-022)
    ├── src/
    │   ├── app/
    │   │   ├── (public)/             # Portada, /congresos/[slug]/programa… (SSR + SEO) → spec-003
    │   │   ├── (auth)/               # /entrar, /registro → 000-core
    │   │   ├── ponente/              # spec-001
    │   │   ├── comite/               # spec-002
    │   │   ├── organizador/          # spec-002 (decidir/asignar), spec-003, spec-008
    │   │   ├── area-personal/        # spec-004, spec-005, spec-007
    │   │   ├── acreditacion/         # spec-006
    │   │   ├── api/trpc/[trpc]/      # Adaptador tRPC
    │   │   ├── api/certificado/[congresoId]/  # PDF → spec-007
    │   │   ├── sitemap.ts, robots.ts # SEO → spec-003
    │   │   └── layout.tsx
    │   ├── server/
    │   │   ├── auth.ts               # Auth.js
    │   │   ├── db.ts                 # PrismaClient
    │   │   └── api/
    │   │       ├── trpc.ts           # contexto, publicProcedure, protectedProcedure, roleProcedure
    │   │       ├── root.ts
    │   │       └── routers/          # una carpeta por router (ver contracts/trpc-api.md)
    │   ├── components/ui/            # shadcn/ui
    │   └── lib/                      # formato de euros/fechas, cliente tRPC
    ├── tests/
    │   ├── integration/              # routers con createCaller, una carpeta por spec
    │   └── e2e/                      # Playwright, un fichero por spec
    └── .env.example
packages/
└── domain/                           # Reglas puras, sin E/S
    ├── src/
    │   ├── intervalos.ts             # solapa(a, b) — A7
    │   ├── congreso.ts               # faseCongreso(), plazoAbierto()
    │   ├── propuesta.ts              # transiciones de estado — A1
    │   ├── tarifa.ts                 # calcularTarifa() — A4
    │   ├── certificado.ts            # porcentajeAsistencia(), horasCertificadas() — 80 %
    │   └── formato.ts                # euros(), fecha() en es-ES
    └── tests/                        # Vitest
docker-compose.yml                    # postgres:16
pnpm-workspace.yaml
package.json
```

**Structure Decision**: monorepo pnpm con `apps/web` y `packages/domain` (R1). Cada spec añade código en su
carpeta de `app/`, su router en `server/api/routers/` y sus pruebas en `tests/integration/<spec>` y `tests/e2e/<spec>.spec.ts`,
de forma que el trabajo de cada historia quede aislado y trazable.

## Reparto del plan entre specs

| Spec | Router tRPC | Rutas de UI | Reglas de `packages/domain` |
|------|-------------|-------------|-----------------------------|
| 000-core | `auth`, `congreso` | `/`, `/entrar`, `/registro` | `congreso.ts`, `formato.ts` |
| 001 | `propuesta` | `/ponente/...` | `plazoAbierto()` |
| 002 | `evaluacion` | `/comite/...`, `/organizador/[slug]/propuestas` | `propuesta.ts` |
| 003 | `programa` | `/organizador/[slug]/programa`, `/congresos/[slug]/programa` | `intervalos.ts` |
| 004 | `inscripcion` | `/congresos/[slug]/inscripcion`, `/area-personal` | `tarifa.ts` |
| 005 | `agenda` | `/area-personal/[slug]/agenda` | `intervalos.ts` |
| 006 | `acreditacion` | `/acreditacion/[slug]` | — |
| 007 | `certificado` | `/area-personal/[slug]/certificado` | `certificado.ts` |
| 008 | `panel` | `/organizador/[slug]/panel` | — |

## Cambios tras `/speckit-clarify` (2026-11-03)

- **P1** (días completos): helper `finDeDia(dia, zona)` / `inicioDeDia(dia, zona)` en `packages/domain/src/fechas.ts`; el seed y las pruebas construyen las fechas límite con él. Sin cambios de esquema.
- **P2** (rol propio): procedimiento `auth.anadirRolPropio` y botón «Quiero ser también ponente/asistente» en la cabecera.
- **P3** (sin gestión de congresos) y **P4** (comité global): confirman el diseño actual; sin cambios.

## Complexity Tracking

Sin violaciones de la Constitución que justificar.
