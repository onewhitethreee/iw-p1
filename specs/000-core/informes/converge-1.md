# Informe `/speckit-converge` · 000-core · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` (skill `speckit-converge`)
- **Commit evaluado**: `467dea6` (tras implement de T033–T041)
- **Instrucción**: «Contrasta la implementación actual de 000-core con spec.md, plan.md, tasks.md, data-model.md y contracts/. Revisa los criterios de aceptación, los casos de error y las obligaciones técnicas documentadas. Identifica el trabajo pendiente y añade tareas trazables para completarlo.»
- **Resultado**: `tasks_appended` · 3 tareas (T042–T044) en `## Phase 7: Convergence`

## Hallazgos

| ID | Tipo | Gravedad | Origen | Evidencia | Tarea |
|----|------|----------|--------|-----------|-------|
| F1 | partial | MEDIUM | FR-021 · Constitución VI | Sin `error.tsx`/`global-error.tsx`: un error inesperado muestra la pantalla por defecto de Next.js en inglés | T042 |
| F2 | partial | LOW | data-model.md · Constitución IV | La migración inicial no tiene restricciones CHECK; invariantes de Congreso, Sala, Tarifa y Evaluación solo documentadas | T043 |
| F3 | contradicts | LOW | quickstart.md | `pnpm --filter web prisma migrate dev` → «None of the selected packages has a "prisma" script»; pnpm 9 vs 10 | T044 |

## Métricas

Requisitos 21 FR + 4 SC · Escenarios 9 + 3 casos límite · Decisiones del plan 12 + contrato 6 procedimientos · Constitución 7 principios · missing 0 / partial 2 / contradicts 1 / unrequested 0 · CRITICAL 0 / HIGH 0 / MEDIUM 1 / LOW 2.

## Prueba reproducible de cada fallo (antes de corregir)

| ID | Entrada | Esperado | Observado (antes) |
|----|---------|----------|-------------------|
| F1 | Provocar un error en un Server Component | Mensaje en español | Pantalla por defecto de Next.js en inglés (no existe `error.tsx`) |
| F2 | `INSERT INTO "Sala" (…, aforo) VALUES (…, 0)` | Rechazo de la BD | Se inserta (0 restricciones CHECK en `migration.sql`) |
| F3 | `pnpm --filter web prisma --version` | Versión de Prisma | `None of the selected packages has a "prisma" script` |
