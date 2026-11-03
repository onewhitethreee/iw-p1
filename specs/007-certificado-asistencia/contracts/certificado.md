# Contrato: certificado (spec-007)

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `certificado.congresos` | query | Con sesión | — | `[{ id, slug, nombre, fin, finalizado }]` (inscripciones `CONFIRMADA` del usuario) |
| `certificado.estado` | query | Con sesión (titular) | `{ congresoId }` | `EstadoCertificado` ([data-model](../data-model.md)) |
| `GET /api/certificado/[congresoId]` | route handler | Con sesión (titular) | — | `200 application/pdf` · `401` sin sesión · `403` texto con el motivo |

| Estado | Motivo |
|--------|--------|
| DISPONIBLE | «Disponible» |
| SIN_INSCRIPCION | «No tienes una inscripción confirmada en este congreso» |
| NO_FINALIZADO | «Disponible cuando termine el congreso (d de mes de aaaa)» |
| AGENDA_VACIA | «No disponible: tu agenda no tiene sesiones» |
| BAJO_UMBRAL | «No disponible: has asistido al N % de las sesiones de tu agenda (A de T); se necesita al menos el 80 %» |

`NOT_FOUND` si el congreso no existe. Ninguna entrada identifica a otra persona (P1).

**PDF**: título «Certificado de asistencia»; nombre del titular; congreso, fechas y sede; sesiones asistidas (fecha, hora, título); «Horas de formación: X h Y min»; fecha de emisión.
