# Verificación de spec-007 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-007` · **Responsable**: Yangfeng Liu · **Datos**: seed de 000-core (recargado en e2e)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 descarga | e2e (asistente1, Simposio) + integración estado (a), descarga (a)(b) | «80 % (4 de 5 sesiones)», «4 h 30 min», PDF `certificado-simposio-salud-digital-2026.pdf` con nombre, congreso, fechas, sede, 4 sesiones y horas | Igual | ✔ |
| 2 | US1-2 60 % | e2e (asistente2) + integración (b) | Motivo exacto, sin botón | Igual | ✔ |
| 3 | US1-3 petición directa | e2e (`/api/certificado/<id>` → 403) + integración descarga (c) | 403 con el mismo motivo | Igual | ✔ |
| 4 | US1-4 no finalizado | e2e (asistente1, Innovación Educativa) + integración (c), con `ahora = fin` disponible | «Disponible cuando termine el congreso (fecha)» y porcentaje provisional | Igual | ✔ |
| 5 | US1-5 agenda vacía | e2e (asistente3) + integración (d) | «No disponible: tu agenda no tiene sesiones» | Igual | ✔ |
| 6 | US1-6 otra persona | integración estado (g) y descarga (d): organizador y otro asistente → `SIN_INSCRIPCION` / 403; sin sesión → 401 | Rechazado | Igual | ✔ |
| 7 | US1-7 sin inscripción | integración (e): sin inscripción y pendiente de pago | «No tienes una inscripción confirmada en este congreso» | Igual | ✔ |
| — | Edge: fuera de agenda; truncado P2 | integración (f) + dominio | No cuentan; 2 de 3 → «66 %» | Igual | ✔ |

**SC-002 (< 3 s)**: la integración descarga (a) mide cálculo + generación del PDF (aserción `< 3000 ms`); en la práctica tarda decenas de milisegundos.

**Notas**: `certificado.congresos` devuelve también `zonaHoraria` para mostrar la fecha de fin en la zona del congreso (contratos de spec-007 y 000-core actualizados). El caso «7 de 9» de T004f se cubre en la prueba de dominio (el escenario de integración tiene 5 sesiones).

**Regresión**: dominio 35/35 · integración 35/35 (000-core 22 + spec-007 13) · e2e 11/11 (000-core 7 + spec-007 4) · lint, typecheck y `next build` sin errores.
