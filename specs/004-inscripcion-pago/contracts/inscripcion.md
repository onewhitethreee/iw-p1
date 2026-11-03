# Contrato: router `inscripcion` (spec-004)

Concreta las filas `inscripcion.*` de [000-core/contracts/trpc-api.md](../../000-core/contracts/trpc-api.md) (sin cambios de firma).

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `presupuesto` | query | P | `{ congresoId }` | `{ tarifaAplicada, limiteTemprana, tipos: [{ tipoAsistente, importeCent }] }` vigentes hoy |
| `crear` | mutation | ASISTENTE | `{ congresoId, tipoAsistente }` | `{ id, importeCent, tarifaAplicada }` |
| `pagar` | mutation | ASISTENTE (propietario) | `{ inscripcionId, tarjeta }` | `{ resultado: "APROBADO" \| "RECHAZADO", mensaje }` |
| `mias` | query | ASISTENTE | — | `[{ id, congreso: {nombre, slug}, tipoAsistente, tarifaAplicada, importeCent, estado, creadaEn, qr: dataURL \| null, codigo: string \| null }]` |

| Código | Cuándo | Mensaje |
|--------|--------|---------|
| `CONFLICT` | ya inscrito | «Ya tienes una inscripción en este congreso» |
| `CONFLICT` | congreso finalizado | «El congreso ha finalizado: ya no se admiten inscripciones» |
| `CONFLICT` | ya confirmada | «Esta inscripción ya está pagada» |
| `FORBIDDEN` | inscripción ajena | «No puedes pagar una inscripción de otra persona» |
| `BAD_REQUEST` | tarjeta no válida | «El número de tarjeta debe tener 16 dígitos» |
| — (200) | pago rechazado | `{ resultado: "RECHAZADO", mensaje: "El pago ha sido rechazado. Prueba con otra tarjeta." }` |
