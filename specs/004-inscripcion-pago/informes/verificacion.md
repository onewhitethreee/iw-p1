# Verificación de spec-004 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-004` · **Datos**: seed de 000-core (recargado por `tests/e2e/global-setup.ts`)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 temprana | e2e (asistente5, Pediatría, estudiante) + integración (a) | 90,00 €, pendiente | Igual; 23:59 del día límite → temprana | ✔ |
| 2 | US1-2 general / P2 en curso | integración (b)(d) | 120,00 € a las 00:00 del día siguiente; en curso se admite | Igual | ✔ |
| 3 | US2-2 rechazo | e2e + integración (b) | «El pago ha sido rechazado…», sigue pendiente | Igual | ✔ |
| 4 | US2-1 aprobado | e2e + integración (a) | Confirmada, QR, código UUID v4, referencia con 4 últimos dígitos | Igual | ✔ |
| 5 | US1-3 duplicada | e2e + integración (c) | Aviso «Ya tienes una inscripción…» / CONFLICT | Igual | ✔ |
| 6 | US2-4 ajena | integración (d) | FORBIDDEN | Igual | ✔ |
| 7 | US1-7 importe manipulado | integración (f) | Ignorado | 25000 (no 1) | ✔ |
| — | US1-5/US1-6 roles | e2e + integración (e) | Enlaces sin sesión; «Añadirme como asistente» | Igual | ✔ |
| — | FR-013 tarjeta no válida / sin guardar número | integración (e)(f) | BAD_REQUEST; ningún número completo en BD | Igual | ✔ |
| — | SC-002 pagos simultáneos | integración (g) | 1 APROBADO | 1 | ✔ |

**SC-001 (< 3 min)**: el recorrido e2e completo tarda ~4 s; medición con una persona **pendiente del responsable**.

**Regresión**: dominio 34/34 · integración 38/38 (000-core 22 + spec-004 16) · e2e 11/11 (000-core 7 + spec-004 4) · lint y typecheck sin errores.
