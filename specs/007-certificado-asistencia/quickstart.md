# Quickstart: validar spec-007

Seed `simposio-salud-digital-2026` (finalizado, 5 sesiones): `asistente1` 4/5 (80 %), `asistente2` 3/5 (60 %), `asistente3` agenda vacía. `congreso-innovacion-educativa-2026` en curso.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 | `asistente1@` → Área personal → Certificado → Simposio | «80 % (4 de 5 sesiones)» y «Descargar certificado» → PDF con nombre, congreso, fechas, sede, 4 sesiones y «Horas de formación: 4 h 30 min» |
| 2 | US1-2 | `asistente2@` | «No disponible: has asistido al 60 %… (3 de 5)…», sin botón |
| 3 | US1-3 | `asistente2@` abre `/api/certificado/<id>` | 403 con el mismo motivo |
| 4 | US1-4 | `asistente1@` → Innovación Educativa | «Disponible cuando termine el congreso (…)» y porcentaje provisional |
| 5 | US1-5 | `asistente3@` → Simposio | «No disponible: tu agenda no tiene sesiones» |
| 6 | US1-6 | `organizador@` abre `/api/certificado/<id>` | 403 (no tiene inscripción: no puede obtener el de nadie) |
| 7 | US1-7 | `asistente5@` → Simposio por URL | «No tienes una inscripción confirmada en este congreso» |

Pruebas: `pnpm --filter web test` (integración 007) · `pnpm --filter web test:e2e`.
