# Research: Acceso con QR (spec-006)

- **R1 Rechazo como resultado** — Decisión: respuesta normal con `resultado`. Motivo: el rechazo es esperado y la pantalla debe mostrarlo en rojo con el motivo, no como un fallo técnico.
- **R2 Orden de comprobación** — Decisión: del dato más básico al más específico; «ya registrado» antes que «aforo» para que quien sale y vuelve a entrar no sea rechazado con la sala llena (FR-005).
- **R3 Concurrencia** — Decisión: `FOR UPDATE` sobre la sesión. Alternativa: contador en la sala (estado duplicado).
- **R4 Refresco** — Decisión: sondeo cada 3 s. Alternativa: SSE (complejidad sin necesidad, Constitución I).
- **R5 Lector** — Decisión: `html5-qrcode` (mantenido, sin dependencias nativas). Alternativa: `BarcodeDetector` nativo (no disponible en todos los navegadores).

- **R6 Solape con otra asistencia (clarify-3 P4, 2026-11-05)** — Decisión: consulta `Asistencia` de la misma inscripción en otra sesión con `sesion.inicio < fin` y `sesion.fin > inicio` (regla A7 de intervalos semiabiertos, la misma de `packages/domain/intervalos`), dentro de la transacción. Motivo: una sola consulta indexada por `inscripcionId`, sin traer todas las sesiones a memoria. Alternativa descartada: recorrer las asistencias con `solapa()` de `packages/domain` (misma regla, más código y más datos).
- **R7 Vigencia de la reserva (spec-005 P2)** — Decisión: importar `reservaVigente` de `packages/domain` en vez de repetir el margen de 10 min. Cuando no es vigente se omite el paso de «plazas sin reservar»; el de aforo sigue igual.
- **R3 (revisión)** — El bloqueo de la sesión no basta para FR-011; se añade el de la inscripción con el orden de spec-005 R1 (inscripción → sesión). Alternativa descartada: bloqueo consultivo (`pg_advisory_xact_lock`) por inscripción; hace lo mismo con un mecanismo nuevo en el proyecto.
