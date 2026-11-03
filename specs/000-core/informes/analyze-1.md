# Informe `/speckit-analyze` · 000-core · iteración 1 (informe inicial, antes de corregir)

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` (skill `speckit-analyze`, solo lectura)
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md de 000-core (incluidos data-model.md y contracts/). Presta atención a criterios sin tareas, tareas sin requisito que las justifique, reglas contradictorias y dependencias con las specs 001-008. Informa de la gravedad y de los documentos afectados.»

## Hallazgos

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| D1 | Constitución | CRITICAL | spec.md · US2 | Constitución III exige caso habitual + error/límite + permisos/estado; US2 solo tiene el habitual. | Añadir escenarios: slug inexistente, acceso sin sesión, congreso finalizado. |
| I1 | Inconsistencia | HIGH | spec-001 Edge Cases/FR-002; spec-004 FR-002 | Tras clarify P1 (días completos), spec-001 habla de «instante de cierre» y spec-004 de «fecha ≤ limiteTemprana». | Reescribir en días (FR-005a) citando la aclaración. |
| C1 | Cobertura | MEDIUM | spec.md FR-013, FR-015, FR-017–FR-020; SC-001 | Reglas compartidas sin tarea en 000-core y sin indicar en qué spec se cubren; SC-001 no verificable en 000-core. | Tabla «Requisito → spec que lo implementa y verifica» en tasks.md. |
| I2 | Inconsistencia | MEDIUM | spec-004 FR-004 / escenario 5 vs FR-003a | Usuario con sesión sin rol asistente que quiere inscribirse: falta remitir a FR-003a. | Escenario nuevo en spec-004. |
| I3 | Inconsistencia | LOW | tasks.md T024 · research.md R11 | react-hook-form en la tarea; implementado con useActionState (documentado en notas). | Actualizar R11/T024. |
| I4 | Inconsistencia | LOW | tasks.md T026 · plan.md | `requireRol()`/`guards.ts` vs `comprobarRol()`/`guards.tsx`. | Unificar nombres. |
| I5 | Inconsistencia | LOW | tasks.md T009, T023 | `plazoEnvioAbierto()` vs `plazoEnvio()`; `select` vs `NativeSelect`. | Unificar nombres. |
| I6 | Inconsistencia | LOW | contracts/trpc-api.md `congreso.porSlug` | La implementación también devuelve salas. | Añadir al contrato. |
| U1 | Infraespecificación | LOW | spec.md SC-004 | «< 1 minuto» sin tarea de medición. | Verificación manual (registro e2e < 2 s). |
| U2 | Infraespecificación | LOW | quickstart.md | Usuarios `demoNN@` del seed no documentados. | Documentar. |
| K1 | Constitución VII | LOW (falso positivo) | prisma/seed.ts | Contraseña `congreso123` en el código. | Credencial pública de demostración, no un secreto. Sin cambios. |

## Métricas

Requisitos 24 · Tareas 39 · Cobertura en 000-core 17/24 (71 %; el resto se cubre en 001–008, ver C1) · Ambigüedades 0 · Duplicados 0 · Críticos 1.
