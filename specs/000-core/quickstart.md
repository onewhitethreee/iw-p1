# Quickstart: levantar y validar la base común

**Fecha**: 2026-11-03

## Requisitos
- Node.js 22 y pnpm 9
- Docker (para PostgreSQL)

## Puesta en marcha (cuando exista el código)
```bash
cp apps/web/.env.example apps/web/.env      # DATABASE_URL, AUTH_SECRET
docker compose up -d                        # postgres:16 en el puerto 5432
pnpm install
pnpm --filter web prisma migrate dev
pnpm --filter web prisma db seed            # datos de ejemplo (FR-022)
pnpm dev                                    # http://localhost:3000
```

## Usuarios de ejemplo (seed)
Contraseña de todos: `congreso123`

| Correo | Roles |
|--------|-------|
| `organizador@congresalia.es` | ORGANIZADOR |
| `comite1@congresalia.es`, `comite2@congresalia.es`, `comite3@congresalia.es` | COMITE |
| `ponente1@congresalia.es`, `ponente2@congresalia.es` | PONENTE |
| `ponente.comite@congresalia.es` | PONENTE, COMITE (para probar que no evalúa su propia propuesta) |
| `asistente1@congresalia.es` … `asistente5@congresalia.es` | ASISTENTE |
| `acreditacion@congresalia.es` | ACREDITACION |

Congresos:
- `jornadas-pediatria-2027`: llamada a comunicaciones abierta, propuestas en todos los estados (HU-01, HU-02, HU-03).
- `congreso-innovacion-educativa-2026`: en curso, programa publicado, inscripciones pagadas y pendientes; incluye la sala «Aula 3» con aforo 2 para demostrar el aforo completo (HU-04, HU-05, HU-06, HU-08).
- `simposio-salud-digital-2026`: finalizado; `asistente1` asistió a 4 de las 5 sesiones de su agenda (80 %) y `asistente2` a 3 de 5 (60 %) (HU-07).

Las fechas del seed se calculan relativas al día en que se ejecuta, para que cada congreso esté siempre en su fase.

## Validación de la base
1. `pnpm test` → pruebas unitarias de `packages/domain` en verde.
2. Abrir `/` sin sesión → aparecen los tres congresos con su fase (spec 000-core, US2).
3. Registrarse como asistente → sesión iniciada; abrir `/organizador/...` → acceso denegado (US1, escenario 3).
4. Llamar a un procedimiento de organizador con la sesión de asistente (prueba de integración `tests/integration/core/roles.test.ts`) → `FORBIDDEN` (SC-001).

Los recorridos de cada historia están en el `quickstart.md` de su spec.
