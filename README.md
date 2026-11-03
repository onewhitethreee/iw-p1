# Congresalia · SI-19 Gestión de Eventos y Congresos (Grupo G16 · Yangfeng Liu)

Proyecto de Ingeniería Web (UA, 2026-27), Parte I: desarrollo mediante Spec-Driven Development con GitHub Spec Kit.

- Narrativa: [docs/descripcion-sistema.md](docs/descripcion-sistema.md)
- Historias de usuario: [docs/historias-usuario.md](docs/historias-usuario.md)
- Reparto: [docs/agrupamiento.md](docs/agrupamiento.md)
- Constitución: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Especificaciones: [specs/](specs/)
  - [000-core](specs/000-core/spec.md): base común (plan, modelo de datos y contrato de la API compartidos)
  - [001](specs/001-enviar-propuesta/spec.md) · [002](specs/002-evaluar-propuestas/spec.md) · [003](specs/003-programa-congreso/spec.md) · [004](specs/004-inscripcion-pago/spec.md) · [005](specs/005-agenda-personal/spec.md) · [006](specs/006-acceso-qr/spec.md) · [007](specs/007-certificado-asistencia/spec.md) · [008](specs/008-panel-tiempo-real/spec.md)
- Memoria: [docs/memoria.md](docs/memoria.md)

Pila: Next.js (App Router) · tRPC + Prisma · PostgreSQL · shadcn/ui

## Puesta en marcha

Requisitos: Node.js 22, pnpm 10 y Docker.

```bash
cp apps/web/.env.example apps/web/.env   # y cambia AUTH_SECRET (openssl rand -base64 32)
docker compose up -d                     # PostgreSQL 16 (BD de desarrollo y de pruebas)
pnpm install
pnpm db:migrate                          # aplica las migraciones
pnpm db:seed                             # datos de ejemplo (fechas relativas a hoy)
pnpm dev                                 # http://localhost:3000
```

Usuarios de ejemplo (contraseña `congreso123`): `organizador@`, `comite1@`, `ponente1@`, `ponente.comite@`,
`asistente1@` … `asistente5@`, `acreditacion@` (todos `@congresalia.es`). Lista completa en
[specs/000-core/quickstart.md](specs/000-core/quickstart.md).

## Pruebas

```bash
pnpm test        # unitarias (packages/domain) + integración de la API (apps/web, BD congresalia_test)
pnpm build && pnpm test:e2e   # Playwright contra `next start` (requiere el seed cargado)
pnpm lint && pnpm typecheck
```

## Estructura

```text
apps/web/          Next.js: páginas (src/app), API tRPC (src/server/api), Prisma (prisma/), pruebas (tests/)
packages/domain/   Reglas de negocio puras y probadas: solapes, plazos, tarifas, certificado, formato
specs/             Especificaciones Spec Kit (000-core común + 001…008, una por historia)
```
