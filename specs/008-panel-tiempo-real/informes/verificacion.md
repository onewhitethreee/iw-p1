# Verificación de spec-008 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-008` · **Responsable**: Yangfeng Liu · **Datos**: seed de 000-core (recargado en e2e)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 cifras y desglose | e2e (35 confirmadas, 5 pendientes, 6 filas) + integración (a) | Totales y desglose tipo × tarifa; rechazados no suman | Igual | ✔ |
| 2 | US1-2 / SC-001 refresco | e2e: pago aprobado insertado con el panel abierto → «36» e ingresos nuevos en ≤ 6 s sin recargar; integración (d) | ≤ 5 s (sondeo cada 5 s) | Igual | ✔ |
| 3 | US1-3 permisos | e2e (asistente1 → «Acceso denegado») + integración (e): FORBIDDEN en los 3 procedimientos para 4 roles | Denegado | Igual | ✔ |
| 4 | US1-4 sin inscripciones | integración (c) | Ceros, 6 filas | Igual | ✔ |
| 5 | US2-1 / US2-3 ocupación y filtro | e2e («Rúbricas…» Completa 100 %, filtro oculta «Gamificación…») + integración US2 (a): P1 0 reservas / 2 asistencias → Completa, 9/10 → Casi completa | Igual | Igual | ✔ |
| 6 | US2-2 asistencia nueva | integración US2 (b) | +1 en el siguiente refresco | Igual | ✔ |
| 7a | US3-1 sin salas libres | e2e («Rúbricas…») + integración (a) | «No hay salas libres en ese horario con aforo suficiente» | Igual | ✔ |
| 7 | US3-1 / US3-2 cambio | e2e: «Competencia digital docente» → solo «Auditorio (aforo 200)» → «Auditorio (200)»; integración (b): reservas y asistencias conservadas | Igual | Igual | ✔ |
| 8 | US3-3 solape al confirmar / concurrencia | integración (c) mensaje «La sala «Grande» ya tiene «Llegó antes» de 14:40 a 15:20»; (c2) dos cambios simultáneos → uno | Igual | Igual | ✔ |
| 9 | US3-4 terminada / finalizado; P2 aforo | integración (d), (e), (a2) | CONFLICT con motivo; empezada sí se mueve | Igual | ✔ |

**SC-002**: integración (b) compara `ingresosCent` con `SUM` directo en SQL y el desglose con el total. **SC-003**: en e2e el cambio son 3 acciones (botón, sala, confirmar). **SC-004**: integración US2 (d) con 1.000 inscripciones, 1.000 pagos, 810 reservas y 50 sesiones: `resumen` < 2 s (aserción).

**Nota**: el programa público (spec-003, otra rama) lee la misma fila `Sesion` que cambia `cambiarSala`; se comprobará en pantalla al integrar las ramas (analyze U1).

## Iteración 2 (converge T014)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 10 | Edge «conexión falla» | e2e: `/api/trpc` cortado con `page.route` | «Sin actualizar desde hh:mm:ss», cifras conservadas, «Sin conexión: …» al pedir salas (no «Failed to fetch»); al volver la red, «Actualizado a las» | Igual | ✔ |

**Regresión**: dominio 37/37 · integración 38/38 (000-core 22 + spec-008 16) · e2e 12/12 (000-core 7 + spec-008 5) · lint, typecheck y `next build` sin errores.
