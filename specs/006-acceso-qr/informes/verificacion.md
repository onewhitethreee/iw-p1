# Verificación de spec-006 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-006` · **Responsable**: Yangfeng Liu · **Datos**: seed de 000-core (recargado en e2e)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 admitido | e2e (asistente3 en «Aprendizaje basado en proyectos…») + integración (a) | «Admitido · Asistente 3», ocupación 1/200 → 2/200; `Asistencia.registradaPorId` = personal | Igual | ✔ |
| 2 | US1-5 ya registrado | e2e (mismo código con espacios) + integración (e), también con la sala llena | «Ya registrado» (ámbar), sin +1 | Igual | ✔ |
| 3 | US1-2 aforo completo | e2e («Rúbricas compartidas…», 2/2) + integración (b) | «Rechazado · Aforo completo», sin asistencia | Igual | ✔ |
| 4 | US1-3 código inventado | e2e + integración (c) | «Acreditación no válida» | Igual | ✔ |
| 5 | US1-4 no confirmada / otro congreso | integración (d) | «Inscripción no confirmada» / «Acreditación de otro congreso» | Igual | ✔ |
| 6 | US1-6 sin rol | e2e (asistente1 → «Acceso denegado») + integración (f): FORBIDDEN en los 3 procedimientos | Denegado | Igual | ✔ |
| 7 | FR-010 ventana | integración (g): 31 min antes / 30 min antes / en el fin | «…se abre a las 09:30» / admitido / «La sesión ya ha terminado» | Igual | ✔ |
| 8 | FR-009 / clarify P3 | integración (h) y (h2) | Sin reserva entra si quedan plazas sin reservar; si no, «No quedan plazas sin reservar»; quien reservó entra | Igual | ✔ |
| 9 | SC-002 concurrencia | integración (i): 10 escaneos simultáneos desde 2 puertas con 1 plaza; (i2) mismo código en 2 puertas | 1 admitido / 1 admitido + 1 «ya registrado» | Igual | ✔ |
| 10 | US2-1 ocupación | integración (ocupacion): admisiones desde otra puerta; pantalla con `refetchInterval` 3 s | 0/100 → 2/100 | Igual | ✔ |

**SC-001 (< 1 s)**: la integración (a) mide la llamada `escanear` completa (bloqueo + comprobaciones + alta): muy por debajo de 1 s (aserción `< 1000 ms`); en e2e el resultado aparece en la pantalla sin espera apreciable.

**SC-003 (100 % rechazadas)**: integración (c) y (d), más el e2e del código inventado.

**Notas de implementación**

- El orden de comprobación sigue el plan R2. El aforo de la sala (`asistencias < aforo`, FR-003) se comprueba para todos antes de la regla de plazas sin reservar (FR-009); así, con la sala llena el motivo es «Aforo completo» también para quien no reservó (quickstart 3). Se ha precisado en `plan.md` (decisión 2).
- En el seed una inscripción pendiente no tiene código (se genera al confirmar, 000-core); el escenario 5 del quickstart se comprueba solo por integración, donde la regla se mantiene en el servidor como defensa.
- La cámara se activa con «Escanear con la cámara» (no se pide permiso al abrir la página); el campo manual está siempre visible (US1-7). Tras cada lectura se ignoran las siguientes durante 2 s.

**Regresión**: dominio 34/34 · integración 38/38 (000-core 22 + spec-006 16) · e2e 11/11 (000-core 7 + spec-006 4) · lint y typecheck sin errores · `next build` correcto.
