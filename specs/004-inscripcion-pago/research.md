# Research: Inscripción y pago (spec-004)

**Fecha**: 2026-11-03 · Sin `NEEDS CLARIFICATION`. Generales en [000-core/research.md](../000-core/research.md).

- **R1 Importe en servidor** — Decisión: el cliente nunca envía el importe; `calcularTarifa` con `ctx.ahora()`. Motivo: US1-6 y Constitución IV. Alternativa descartada: validar el importe enviado (más superficie de error).
- **R2 Unicidad** — Decisión: índice único existente + traducción de `P2002`. Alternativa: comprobar antes de crear (carrera con doble clic).
- **R3 Pago concurrente** — Decisión: `FOR UPDATE` sobre la inscripción. Alternativa: `updateMany` condicionado a `PENDIENTE_PAGO` (no permite registrar el intento rechazado con coherencia).
- **R4 Pasarela simulada** — Decisión: 16 dígitos; rechaza `4000000000000002`. Alternativas: Luhn, caducidad y CVV (más datos sin valor para la historia, clarify P3).
- **R5 Rechazo** — Decisión: respuesta normal con `resultado`. Motivo: el rechazo es un resultado de negocio esperado, no un fallo.
- **R6 QR** — Decisión: paquete `qrcode` (PNG en data URL, nivel de corrección M). Alternativa: SVG en cliente (más JavaScript en el móvil).
