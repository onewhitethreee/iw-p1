# Quickstart: validar spec-008

Seed `congreso-innovacion-educativa-2026` (en curso): 41 inscripciones (37 confirmadas, 4 pendientes según el seed de relleno), «Rúbricas compartidas…» en Aula 3 (aforo 2) con 2 reservas y 2 asistencias; «Competencia digital docente» mañana en Aula 3 con 1 reserva y el Auditorio libre a esa hora.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 | `organizador@` → Panel → Innovación Educativa | Confirmadas, pendientes, ingresos en euros y desglose de 6 filas; totales = BD (SC-002) |
| 2 | US1-2 | Con el panel abierto, confirmar un pago (o insertar uno aprobado) | Cifras actualizadas en ≤ 5 s y nueva hora de actualización |
| 3 | US1-3 | `asistente1@` en `/organizador/panel` | Acceso denegado; `panel.resumen` → FORBIDDEN |
| 4 | US1-4 | Panel de un congreso sin inscripciones (Pediatría) | Ceros |
| 5 | US2-1/2-3 | Ver «Rúbricas compartidas…» y marcar «Solo completas o casi completas» | «Completa» (100 %); el filtro la deja visible y oculta las demás no llenas |
| 6 | US2-2 | Admitir una entrada en otra sesión (spec-006 o insertando una asistencia) | Asistencias +1 en ≤ 5 s |
| 7 | US3-1/3-2 | «Competencia digital docente» → Cambiar de sala | Lista sin Sala Magna (ocupada) ni Aula 3 (actual); elegir Auditorio → aforo 200 en el panel |
| 8 | US3-3 | Integración: otra sesión ocupa la sala entre la lista y la confirmación | `CONFLICT` por solape; la sesión no cambia |
| 9 | US3-4 | Sesión terminada / congreso finalizado | Sin botón; `CONFLICT` |

Pruebas: `pnpm --filter web test` (integración 008, incluida la carga de SC-004) · `pnpm --filter web test:e2e`.
