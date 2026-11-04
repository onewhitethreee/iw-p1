# Contrato: router `inscripcion` (spec-004)

Concreta las filas `inscripcion.*` de [000-core/contracts/trpc-api.md](../../000-core/contracts/trpc-api.md) (sin cambios de firma; `cancelar` se añade también en 000-core tras clarify-2 P4).

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `presupuesto` | query | P | `{ congresoId }` | `{ tarifaAplicada, limiteTemprana, tipos: [{ tipoAsistente, importeCent }] }` vigentes hoy |
| `crear` | mutation | ASISTENTE | `{ congresoId, tipoAsistente }` | `{ id, importeCent, tarifaAplicada }` |
| `pagar` | mutation | ASISTENTE (propietario) | `{ inscripcionId, tarjeta }` | `{ resultado: "APROBADO" \| "RECHAZADO", mensaje }` |
| `cancelar` | mutation | ASISTENTE (propietario) | `{ inscripcionId }` | `{ estado: "CANCELADA" }`. Solo desde `PENDIENTE_PAGO` (FR-014, clarify-2 P4) |
| `mias` | query | ASISTENTE | — | `[{ id, congreso: {nombre, slug}, tipoAsistente, tarifaAplicada, importeCent, estado, creadaEn, qr: dataURL \| null, codigo: string \| null }]` |

| Código | Cuándo | Mensaje |
|--------|--------|---------|
| `CONFLICT` | ya inscrito con una inscripción pendiente o confirmada (si estaba `CANCELADA`, `crear` la reactiva) | «Ya tienes una inscripción en este congreso» |
| `CONFLICT` | congreso finalizado | «El congreso ha finalizado: ya no se admiten inscripciones» |
| `CONFLICT` | ya confirmada | «Esta inscripción ya está pagada» |
| `CONFLICT` | `pagar` una cancelada | «Esta inscripción está cancelada» |
| `CONFLICT` | `cancelar` una confirmada | «Una inscripción pagada no se puede cancelar» |
| `CONFLICT` | `cancelar` una ya cancelada | «Esta inscripción ya está cancelada» |
| `FORBIDDEN` | `cancelar` una inexistente o ajena | «No puedes cancelar una inscripción de otra persona» |
| `FORBIDDEN` | inscripción ajena | «No puedes pagar una inscripción de otra persona» |
| `BAD_REQUEST` | tarjeta no válida | «El número de tarjeta debe tener 16 dígitos» |
| — (200) | pago rechazado | `{ resultado: "RECHAZADO", mensaje: "El pago ha sido rechazado. Prueba con otra tarjeta." }` |
