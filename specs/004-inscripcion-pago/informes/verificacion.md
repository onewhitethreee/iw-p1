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

## Estimación KLM (SC-001 < 3 min) · 2026-11-04

Medición con persona real **todavía pendiente**. Mientras tanto, estimación con el *Keystroke-Level Model* sobre la interfaz real ([informe](../../000-core/informes/estimacion-klm.md), script `apps/web/tests/klm/estimar-klm.ts`): 20,2 s (medio) / 34,9 s (lento) ✔, empezando un clic antes (ficha del congreso).

## Iteración tras clarify-2 (T014–T015, FR-014) · 2026-11-05

Rama `spec-004-clarify-2`. Las pruebas se escribieron **antes** del cambio (`tests/integration/004/cancelar.test.ts` y la actualización de `inscribir.test.ts` (h)) y se ejecutaron sobre el código anterior.

| # | Escenario | Entrada | Esperado | Observado **antes** | Observado **después** | Resultado |
|---|-----------|---------|----------|---------------------|-----------------------|-----------|
| 10 | US2-6 / (a) cancelar | pendiente de estudiante con un pago rechazado → `cancelar` | `CANCELADA`; el pago rechazado se conserva | ✘ no existe `cancelar` | Igual que lo esperado | ✔ |
| 11 | US2-6 / (b) volver a inscribirse | tras cancelar, `crear` como profesional a las 23:59 del día límite | Misma inscripción, `PENDIENTE_PAGO`, profesional, 250,00 € temprana; 1 fila; 1 pago anterior | ✘ «Ya tienes una inscripción…» (la fila bloqueaba) | Igual que lo esperado | ✔ |
| 12 | (h) precio al volver | cancelar y `crear` a las 00:00 del día siguiente al límite | Estudiante 120,00 € general | ✘ | Igual que lo esperado | ✔ |
| 13 | US2-7 / (c) confirmada | `cancelar` una pagada | `CONFLICT` «Una inscripción pagada no se puede cancelar»; sigue confirmada | ✘ | Igual que lo esperado | ✔ |
| 14 | US2-7 / (d) ajena o inexistente | `cancelar` con otro usuario | `FORBIDDEN` «No puedes cancelar una inscripción de otra persona» | ✘ | Igual que lo esperado | ✔ |
| 15 | (e) ya cancelada | segundo `cancelar` | `CONFLICT` «Esta inscripción ya está cancelada» | ✘ | Igual que lo esperado | ✔ |
| 16 | (f) pagar cancelada | `pagar` tras `cancelar` | `CONFLICT` «Esta inscripción está cancelada»; sin pago | ✘ | Igual que lo esperado | ✔ |
| 17 | (g) cancelar ∥ pagar ×5 | ambas a la vez | `CONFIRMADA` + 1 aprobado, o `CANCELADA` + 0; nunca mixto | ✔ *(sin `cancelar`, solo podía ganar el pago: pasaba sin probar nada)* | ✔ con las dos operaciones reales | ✔ |
| 18 | US2-6 interfaz (T015) | usuario nuevo: inscribirse estudiante → «Cancelar inscripción» → «Sí, cancelar» → «Inscribirme de nuevo» profesional | Aviso del precio, «Cancelada» sin «Pagar», después «Pendiente de pago» profesional, 1 tarjeta | — (prueba nueva) | Igual que lo esperado | ✔ |

Comando del «antes»: `pnpm exec vitest run tests/integration/004` → **8 failed | 16 passed**. Después: **24/24**.

**Regresión** (enunciado §5.4; cambia un enum compartido de 000-core): dominio 42/42 · integración **178/178** (170 + 8) · e2e **48/48** (47 + 1, `E2E_PORT=3300`) · lint y typecheck sin errores · `next build` correcto. Agenda, acreditación, certificado y panel siguen en verde sin cambios. `prisma migrate diff` (BD → `schema.prisma`) da una migración vacía.

*Nota de entorno*: `prisma generate` no pudo sustituir `query_engine-windows.dll.node` porque lo tenían abierto dos `next start` antiguos (puertos 3100 y 3200). El cliente TypeScript sí se regeneró (incluye `CANCELADA`) y el binario del motor no depende del esquema. Conviene repetir `pnpm exec prisma generate` cuando esos procesos estén cerrados.

## Iteración 4 (converge-4 → T017, navegación en el cliente) · 2026-11-05

| # | Escenario | Entrada | Esperado | Observado **antes** | Observado **después** | Resultado |
|---|-----------|---------|----------|---------------------|-----------------------|-----------|
| 19 | US2-1 tras pagar | pagar con 4111…; en `?pagada=1` pulsar «Área personal» | «Confirmada» con QR | ✘ «Pendiente de pago · Pagar 90,00 € · Cancelar inscripción» (caché del router) | Igual que lo esperado | ✔ |
| 20 | US2-6 tras volver a inscribirse | cancelar → «Inscribirme de nuevo» profesional → «Área personal» | «Pendiente de pago · Profesional · 250,00 €» | ✘ «Cancelada · Estudiante · 90,00 €» | Igual que lo esperado | ✔ |

Comando: `E2E_PORT=3300 pnpm exec playwright test tests/e2e/004-inscripcion.spec.ts`. Antes: fallaron los dos escenarios (cada uno en su ejecución, porque la serie se detiene en el primer fallo). Después: **5/5**. Regresión e2e completa **48/48**; lint, typecheck y `next build` ✔.
