# Data Model: Inscripción y pago (spec-004)

**Sin entidades ni migraciones nuevas.** Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `Tarifa` | Importes temprano/general por tipo (CHECK: general ≥ temprano ≥ 0) |
| `Inscripcion` | Única por `(congresoId, usuarioId)`; `tipoAsistente`, `tarifaAplicada` e `importeCent` fijados al crear e **inmutables mientras no se cancele** (clarify P1, FR-011); `estado PENDIENTE_PAGO → CONFIRMADA`, o `PENDIENTE_PAGO → CANCELADA → PENDIENTE_PAGO` en la misma fila al volver a inscribirse, con tipo, tarifa e importe nuevos (clarify-2 P4, R7); `codigoAcreditacion` UUID v4 al confirmar; `confirmadaEn` |
| `Pago` | Uno por intento: `importeCent`, `resultado APROBADO/RECHAZADO`, `referencia SIM-xxxxxxxx-NNNN`; como mucho uno `APROBADO` por inscripción |

## Transiciones

| Estado | Acción | Resultado |
|--------|--------|-----------|
| — | `crear` (congreso no finalizado) | `PENDIENTE_PAGO` + importe fijado |
| `PENDIENTE_PAGO` | pago rechazado | `PENDIENTE_PAGO` + `Pago RECHAZADO` |
| `PENDIENTE_PAGO` | pago aprobado | `CONFIRMADA` + `Pago APROBADO` + código |
| `CONFIRMADA` | pagar | `CONFLICT` |
