---
description: "Lista de tareas de la base común (000-core)"
---

# Tasks: Núcleo común de Congresalia (000-core)

**Input**: Documentos de diseño en `/specs/000-core/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/trpc-api.md](contracts/trpc-api.md)

**Tests**: SÍ. La Constitución (Restricciones técnicas) exige pruebas unitarias de las reglas de negocio y de integración que demuestren que se validan en el servidor (SC-001).

**Responsable**: Yangfeng Liu · **Fecha**: 2026-11-03 · **Iteración**: 1

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (ficheros distintos, sin dependencias pendientes)
- **[Story]**: US1 = acceso con cuenta y roles · US2 = consultar congresos

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: monorepo, herramientas y entorno local

- [x] T001 Crear el monorepo pnpm: `package.json` raíz (scripts `dev`, `build`, `test`, `lint`, `db:*`), `pnpm-workspace.yaml` con `apps/*` y `packages/*`, `.nvmrc` (22) y `.gitignore` ampliado
- [x] T002 Crear la app Next.js 15 (App Router, TypeScript estricto, alias `~/*` → `src/*`) en `apps/web/` con `package.json`, `tsconfig.json`, `next.config.ts`
- [x] T003 [P] Configurar Tailwind CSS v4 y la base de shadcn/ui (`components.json`, `src/lib/utils.ts`, `src/app/globals.css` con tokens) en `apps/web/`
- [x] T004 [P] Crear el paquete `packages/domain/` (`package.json`, `tsconfig.json`, `src/index.ts`) con Vitest configurado
- [x] T005 [P] Crear `docker-compose.yml` (servicio `db`: `postgres:16`, puerto 5432, volumen) y `apps/web/.env.example` (`DATABASE_URL`, `DATABASE_URL_TEST`, `AUTH_SECRET`, `AUTH_URL`) — sin secretos reales (Constitución VII)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: esquema de datos, reglas compartidas, tRPC y seed. **Ninguna spec 001–008 puede empezar sin esta fase.**

### Modelo de datos

- [x] T006 Traducir [data-model.md](data-model.md) a `apps/web/prisma/schema.prisma`: enums `Rol`, `EstadoPropuesta`, `TipoAsistente`, `EstadoInscripcion`, `ResultadoPago`, `EstadoPrograma`, `TarifaAplicada`; modelos `Usuario` (email único), `UsuarioRol` (PK compuesta), `Congreso` (slug único, `zonaHoraria` por defecto `Europe/Madrid`, `estadoPrograma` por defecto `BORRADOR`), `AreaTematica` (único `congresoId+nombre`), `Propuesta` (estado por defecto `ENVIADA`), `Asignacion` (único `propuestaId+evaluadorId`), `Evaluacion` (`asignacionId` único), `Sala` (único `congresoId+nombre`), `Sesion` (`propuestaId` único), `Tarifa` (único `congresoId+tipoAsistente`), `Inscripcion` (único `congresoId+usuarioId`, `codigoAcreditacion` único), `Pago`, `EntradaAgenda` (único `inscripcionId+sesionId`), `Asistencia` (único `inscripcionId+sesionId`); importes en céntimos `Int`; fechas `DateTime @db.Timestamptz`
- [x] T007 Generar la migración inicial en `apps/web/prisma/migrations/` y el cliente Prisma singleton en `apps/web/src/server/db.ts`

### Reglas compartidas (`packages/domain`) — con pruebas primero

- [x] T008 [P] Pruebas de `solapa(a, b)` (intervalos semiabiertos, A7: contiguos no solapan, contenido, idéntico, parcial) en `packages/domain/tests/intervalos.test.ts`
- [x] T009 [P] Pruebas de `faseCongreso()` (`LLAMADA_ABIERTA`, `EN_PREPARACION`, `EN_CURSO`, `FINALIZADO`, límites incluidos/excluidos) y `plazoEnvioAbierto()` (`[envioAbre, envioCierra)`) en `packages/domain/tests/congreso.test.ts`
- [x] T010 [P] Pruebas de transiciones de propuesta (A1: asignar, decidir solo con ≥ 2 evaluaciones, estados finales) en `packages/domain/tests/propuesta.test.ts`
- [x] T011 [P] Pruebas de `calcularTarifa()` (A4: temprana si `fecha ≤ limiteTemprana`, general si no) en `packages/domain/tests/tarifa.test.ts`
- [x] T012 [P] Pruebas de `porcentajeAsistencia()`, `cumpleUmbral()` (`asistidas × 100 ≥ 80 × total`, agenda vacía no cumple) y `horasCertificadas()` en `packages/domain/tests/certificado.test.ts`
- [x] T013 [P] Pruebas de `euros()` («1.250,00 €») y `fechaHora()` en zona del congreso en `packages/domain/tests/formato.test.ts`
- [x] T014 Implementar `intervalos.ts`, `congreso.ts`, `propuesta.ts`, `tarifa.ts`, `certificado.ts`, `formato.ts` y exportarlos en `packages/domain/src/index.ts` hasta que T008–T013 pasen

### API y autenticación

- [x] T015 Configurar Auth.js v5 con proveedor Credentials (bcrypt) y sesión JWT en `apps/web/src/server/auth.ts` y `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- [x] T016 Crear el contexto tRPC (relee el usuario y sus roles de la BD en cada petición, R2) y los procedimientos `publicProcedure`, `protectedProcedure`, `roleProcedure(...roles)` con mensajes de error en español en `apps/web/src/server/api/trpc.ts`
- [x] T017 Crear `appRouter` en `apps/web/src/server/api/root.ts`, el adaptador `apps/web/src/app/api/trpc/[trpc]/route.ts`, el cliente React (`apps/web/src/trpc/react.tsx`) y el *caller* de servidor (`apps/web/src/trpc/server.ts`)

### Datos de ejemplo

- [x] T018 Implementar `apps/web/prisma/seed.ts` (FR-022) con fechas relativas al día de ejecución: usuarios de [quickstart.md](quickstart.md) (contraseña `congreso123`); congresos `jornadas-pediatria-2027` (llamada abierta, propuestas en los 4 estados, una del usuario `ponente.comite`), `congreso-innovacion-educativa-2026` (en curso, programa publicado, salas incluida «Aula 3» aforo 2 completa, tarifas, inscripciones confirmadas y pendientes con pagos, agendas y asistencias) y `simposio-salud-digital-2026` (finalizado: `asistente1` 4/5 asistencias de agenda, `asistente2` 3/5)

### Infraestructura de pruebas

- [x] T019 Configurar Vitest de integración en `apps/web/vitest.config.ts` con `tests/integration/setup.ts` (usa `DATABASE_URL_TEST`, aplica migraciones, limpia tablas) y un helper `crearCaller(usuario)` en `apps/web/tests/integration/helpers.ts`

**Checkpoint**: base lista; las specs 001–008 pueden empezar en sus ramas.

---

## Phase 3: User Story 1 - Acceder con mi cuenta y mis roles (Priority: P1) 🎯 MVP

**Goal**: registro, inicio de sesión y control de acceso por rol en servidor y en UI.

**Independent Test**: registrarse como asistente, iniciar sesión, ver el menú de su rol e intentar entrar en `/organizador` (rechazado).

### Tests for User Story 1

- [x] T020 [P] [US1] Prueba de integración de `auth.registrar` (crea con rol elegido; `CONFLICT` con correo repetido; rechaza contraseña < 8 caracteres; no admite rol `ORGANIZADOR`) en `apps/web/tests/integration/core/auth.test.ts`
- [x] T021 [P] [US1] Prueba de integración de roles (asistente → procedimiento de organizador = `FORBIDDEN`; sin sesión = `UNAUTHORIZED`; rol retirado en BD se rechaza en la siguiente llamada) en `apps/web/tests/integration/core/roles.test.ts`

### Implementation for User Story 1

- [x] T022 [US1] Router `auth` (`registrar`, `yo`, `asignarRol` solo ORGANIZADOR) según [contracts/trpc-api.md](contracts/trpc-api.md) en `apps/web/src/server/api/routers/auth.ts`
- [x] T023 [P] [US1] Componentes shadcn/ui necesarios (`button`, `input`, `label`, `card`, `badge`, `select`, `table`, `alert`) en `apps/web/src/components/ui/`
- [x] T024 [US1] Páginas `/registro` y `/entrar` con react-hook-form + zod y mensajes en español en `apps/web/src/app/(auth)/`
- [x] T025 [US1] Cabecera con usuario, roles, enlaces por rol y «Salir» en `apps/web/src/components/cabecera.tsx` y `apps/web/src/app/layout.tsx`
- [x] T026 [US1] Protección de zonas por rol (`requireRol()` en servidor + página «Acceso denegado») en `apps/web/src/server/guards.ts` y layouts de `apps/web/src/app/{organizador,comite,ponente,acreditacion,area-personal}/layout.tsx` (con página índice provisional)

**Checkpoint**: US1 funcional y probada.

---

## Phase 4: User Story 2 - Consultar congresos disponibles (Priority: P2)

**Goal**: portada pública con los congresos y su fase.

**Independent Test**: abrir `/` sin sesión y ver los tres congresos del seed con nombre, fechas, sede y fase.

- [x] T027 [P] [US2] Prueba de integración de `congreso.listar` y `congreso.porSlug` (fase calculada, `NOT_FOUND` con slug inexistente) en `apps/web/tests/integration/core/congreso.test.ts`
- [x] T028 [US2] Router `congreso` (`listar`, `porSlug` con áreas y tarifas) en `apps/web/src/server/api/routers/congreso.ts`
- [x] T029 [US2] Portada `/` (Server Component) con tarjetas de congreso, fechas en zona del congreso y fase en `apps/web/src/app/page.tsx`, y ficha básica `/congresos/[slug]` en `apps/web/src/app/congresos/[slug]/page.tsx`

**Checkpoint**: US1 y US2 funcionales.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T030 [P] Configurar ESLint (next) y `typecheck` en todos los paquetes; `pnpm lint` y `pnpm typecheck` sin errores
- [x] T031 [P] Configurar Playwright con una prueba humo (portada + registro + acceso denegado) en `apps/web/playwright.config.ts` y `apps/web/tests/e2e/core.spec.ts`
- [x] T032 Actualizar `README.md` con la puesta en marcha y validar [quickstart.md](quickstart.md) de principio a fin

---

## Notas de implementación (iteración 1, 2026-11-03)

- **T024**: los formularios de entrar y registro usan `useActionState` + acciones de servidor con validación zod en el servidor, en lugar de react-hook-form: es más simple (Constitución I) y el servidor ya devuelve los errores por campo. react-hook-form se reserva para formularios más largos (spec-001 en adelante).
- **T019**: `cargarUsuario` se movió a `src/server/usuarios.ts` (sin `server-only`) para poder usarlo desde las pruebas de integración.
- **T031**: la primera ejecución falló porque `getByRole("alert")` también encontraba el anunciador de rutas de Next.js; se acotó el selector a `main`. Era un fallo de la prueba, no de la aplicación.
- **T029**: en la revisión visual, la etiqueta de fase ocupaba todo el ancho de la tarjeta; se ajustó el componente `Badge` (`w-fit`).
- **Entorno**: en la máquina de desarrollo sin Docker se usó un PostgreSQL 16 local con las mismas credenciales que `docker-compose.yml`.

### Resultados

| Comprobación | Resultado |
|--------------|-----------|
| `packages/domain` (Vitest) | 28/28 ✔ |
| Integración `apps/web` (Vitest + PostgreSQL) | 12/12 ✔ |
| E2E Playwright (`tests/e2e/core.spec.ts`) | 4/4 ✔ |
| `pnpm lint` · `pnpm typecheck` · `pnpm build` | sin errores |

## Dependencies & Execution Order

- **Setup (T001–T005)** → **Foundational (T006–T019)** → **US1 (T020–T026)** → **US2 (T027–T029)** → **Polish (T030–T032)**.
- T006 → T007 → T018. T008–T013 → T014. T015 → T016 → T017.
- US2 solo depende de Foundational; podría hacerse antes que US1.
- Las specs 001–008 dependen de que termine la fase 2 y de `roleProcedure` (T016).

## Parallel Example

```text
# Tras T004, todas las pruebas de dominio a la vez:
T008 intervalos · T009 congreso · T010 propuesta · T011 tarifa · T012 certificado · T013 formato
# En US1:
T020 auth.test · T021 roles.test · T023 componentes UI
```

## Implementation Strategy

1. Setup + Foundational: base que desbloquea las 8 specs.
2. US1 (MVP): ya se puede entrar con cualquier usuario del seed.
3. US2: portada pública.
4. Polish: lint, e2e humo, quickstart validado. Commit en `main` y rebase de las ramas `spec-00X`.
