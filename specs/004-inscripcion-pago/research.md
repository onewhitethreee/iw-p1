# Research: Inscripción y pago (spec-004)

**Fecha**: 2026-11-03 · Sin `NEEDS CLARIFICATION`. Generales en [000-core/research.md](../000-core/research.md).

- **R1 Importe en servidor** — Decisión: el cliente nunca envía el importe; `calcularTarifa` con `ctx.ahora()`. Motivo: US1-6 y Constitución IV. Alternativa descartada: validar el importe enviado (más superficie de error).
- **R2 Unicidad** — Decisión: índice único existente + traducción de `P2002`. Alternativa: comprobar antes de crear (carrera con doble clic).
- **R3 Pago concurrente** — Decisión: `FOR UPDATE` sobre la inscripción. Alternativa: `updateMany` condicionado a `PENDIENTE_PAGO` (no permite registrar el intento rechazado con coherencia).
- **R4 Pasarela simulada** — Decisión: 16 dígitos; rechaza `4000000000000002`. Alternativas: Luhn, caducidad y CVV (más datos sin valor para la historia, clarify P3).
- **R5 Rechazo** — Decisión: respuesta normal con `resultado`. Motivo: el rechazo es un resultado de negocio esperado, no un fallo.
- **R6 QR** — Decisión: paquete `qrcode` (PNG en data URL, nivel de corrección M). Alternativa: SVG en cliente (más JavaScript en el móvil).

## R7. Cancelar y volver a inscribirse (clarify-2 P4, 2026-11-05)
- **Decisión**: nuevo valor `CANCELADA` en `EstadoInscripcion`. Volver a inscribirse **reutiliza la misma fila**: `CANCELADA → PENDIENTE_PAGO` con tipo, tarifa, importe y `creadaEn` nuevos. Cancelar y reactivar son `updateMany` con el estado en el `where`, así que son atómicos y no hacen falta bloqueos nuevos.
- **Motivo**: se conserva el invariante «una fila por usuario y congreso» del que dependen agenda (spec-005), acreditación (spec-006), certificado (spec-007) y panel (spec-008), que buscan la inscripción por `(congresoId, usuarioId)` o filtran por estado. Ninguna de esas specs cambia. Los intentos de pago anteriores siguen en la misma fila (FR-014).
- **Alternativa descartada**: una fila nueva por inscripción con un índice único parcial `WHERE estado <> 'CANCELADA'`. Obligaría a cambiar las búsquedas por `(congresoId, usuarioId)` de spec-005 y spec-007 y a filtrar las canceladas en todas las demás, sin ninguna ventaja que pida la spec.
- **Coste**: no queda registrado *cuándo* se canceló una inscripción que después se reactiva. La spec no lo pide (Constitución II).
