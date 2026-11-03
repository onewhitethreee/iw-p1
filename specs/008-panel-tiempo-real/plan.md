# Implementation Plan: Consultar el panel del congreso en tiempo real (HU-08)

**Branch**: `spec-008` | **Date**: 2026-11-03 | **Spec**: [spec.md](spec.md) | **Responsable**: Yangfeng Liu

**Base común**: [000-core/plan.md](../000-core/plan.md) · [data-model](../000-core/data-model.md) · [contrato](../000-core/contracts/trpc-api.md)

## Summary

El organizador abre el panel de un congreso y ve inscripciones (confirmadas/pendientes), ingresos con desglose por tipo
de asistente × tarifa y la ocupación de cada sesión, refrescados cada 5 s. Desde una sesión llena puede cambiarla a una
sala libre con aforo suficiente. Técnicamente: router tRPC `panel` (`resumen`, `salasLibres`, `cambiarSala`), consultas
agregadas en PostgreSQL, regla pura `nivelOcupacion()` en `packages/domain`, y página cliente con `refetchInterval: 5000`.
Sin entidades ni migraciones nuevas.

## Technical Context

**Language/Version**: TypeScript 5 · Node.js 22 · **Primary Dependencies**: Next.js 15 · tRPC 11 · TanStack Query · Prisma 6 · zod · shadcn/ui
**Storage**: PostgreSQL 16 (agregados con `groupBy`/`count` y una consulta SQL para ingresos por tipo × tarifa) · **Testing**: Vitest (dominio; integración con `createCaller`, `ahora` simulado, carga de 1.000 inscripciones) · Playwright
**Target Platform**: navegador de escritorio del organizador · **Performance Goals**: SC-001 ≤ 5 s; SC-004 < 2 s con 1.000 inscripciones y 50 sesiones · **Constraints**: reglas en el servidor; importes en céntimos
**Scale/Scope**: 2 pantallas, 3 procedimientos

## Constitution Check

| Principio | Cómo se cumple | Estado |
|-----------|----------------|--------|
| I. Simplicidad | Sondeo cada 5 s (A9) en lugar de WebSockets/SSE; sin exportaciones (Assumptions) | ✅ |
| II. Cero alcance fantasma | Solo FR-001…FR-006; el cambio de sala no cambia horarios | ✅ |
| III. Verificable | Habitual (totales, ocupación, mover), error (solape al confirmar, sesión terminada) y permisos/estado (no organizador, congreso finalizado, sin inscripciones) | ✅ |
| IV. Reglas en el servidor | Totales calculados en el servidor; `cambiarSala` revalida todo con bloqueo | ✅ |
| V. Base común | **Contrato y plan de 000-core actualizados primero** (`panel.*`, `ocupacion.ts`); entidades de 000-core | ✅ |
| VI. Español | Euros con `euros()`; horas en la zona del congreso; mensajes en español | ✅ |
| VII. Datos personales | El panel solo muestra cifras agregadas, ningún dato de asistentes | ✅ |

## Project Structure

```text
packages/domain/src/ocupacion.ts                 # nivelOcupacion(reservas, asistencias, aforo) → {porcentaje, nivel}
apps/web/src/
├── server/api/routers/panel.ts                  # resumen, salasLibres, cambiarSala
├── server/api/root.ts                           # registra `panel`
├── app/organizador/panel/page.tsx               # elegir congreso
└── app/organizador/panel/[slug]/                # page.tsx + panel.tsx (cliente: cifras, desglose, sesiones, filtro, cambiar sala)
apps/web/tests/integration/008/*.test.ts · apps/web/tests/e2e/008-panel.spec.ts
```

## Decisiones de diseño

1. **Sondeo cada 5 s** (R1, A9): `useQuery(panel.resumen)` con `refetchInterval: 5000`, `retry: false`; se muestra «Actualizado a las hh:mm:ss» con `calculadoEn`; si el refresco falla se conservan los datos y se avisa «Sin actualizar desde hh:mm:ss» (Edge Cases).
2. **Agregados en la base de datos** (R2, SC-002/SC-004): `inscripcion.groupBy([tipoAsistente, tarifaAplicada, estado])` para los recuentos; ingresos con `SUM(p."importeCent")` de pagos `APROBADO` agrupando por tipo × tarifa (una consulta SQL); sesiones con `_count` de `agendas` y `asistencias`. El desglose siempre tiene las 6 combinaciones (ceros incluidos, US1-4).
3. **Ocupación** (R3, P1): `nivelOcupacion()` en el dominio: `porcentaje = floor(máx(reservas, asistencias) × 100 / aforo)`; `COMPLETA` si máx ≥ aforo, `CASI_COMPLETA` si máx × 100 ≥ 90 × aforo, `null` en otro caso (comparación sin redondeo).
4. **Cambio de sala propio del panel** (R4): `panel.cambiarSala` no depende de la rama spec-003. Aplica las reglas de spec-003 que afectan a un cambio de sala con el horario intacto: congreso no finalizado (FR-012), sala del mismo congreso, sin solape en la sala destino (FR-005, mensaje «La sala «X» ya tiene «título» de HH:mm a HH:mm», FR-008); más P2 (aforo ≥ máx(reservas, asistencias)) y P3 (`ahora < fin`). El solape de ponente no cambia porque el horario no cambia. Transacción con `SELECT … FROM "Sala" WHERE id = destino FOR UPDATE` y `… "Sesion" WHERE id = sesión FOR UPDATE` para serializar cambios concurrentes a la misma sala (US3-3).
5. **Salas libres** (R5): misma regla que `cambiarSala` sin escribir; excluye la sala actual; ordenadas por aforo. `cambiarSala` revalida (la lista puede quedar obsoleta, US3-3).
6. **Pantallas** (R6): `/organizador/panel` (congresos) y `/organizador/panel/[slug]` con tarjetas de cifras, tabla de desglose, tabla de sesiones con insignias, casilla «Solo completas o casi completas» (US2-3, filtro en el cliente) y, por sesión movible, «Cambiar de sala» que despliega un selector con las salas libres y «Confirmar».
