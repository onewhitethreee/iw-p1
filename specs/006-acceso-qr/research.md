# Research: Acceso con QR (spec-006)

- **R1 Rechazo como resultado** — Decisión: respuesta normal con `resultado`. Motivo: el rechazo es esperado y la pantalla debe mostrarlo en rojo con el motivo, no como un fallo técnico.
- **R2 Orden de comprobación** — Decisión: del dato más básico al más específico; «ya registrado» antes que «aforo» para que quien sale y vuelve a entrar no sea rechazado con la sala llena (FR-005).
- **R3 Concurrencia** — Decisión: `FOR UPDATE` sobre la sesión. Alternativa: contador en la sala (estado duplicado).
- **R4 Refresco** — Decisión: sondeo cada 3 s. Alternativa: SSE (complejidad sin necesidad, Constitución I).
- **R5 Lector** — Decisión: `html5-qrcode` (mantenido, sin dependencias nativas). Alternativa: `BarcodeDetector` nativo (no disponible en todos los navegadores).
