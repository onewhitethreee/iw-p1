# Contrato: router `agenda` (spec-005)

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `congresos` | query | ASISTENTE | — | `[{ slug, nombre }]` con inscripción confirmada |
| `sesiones` | query | ASISTENTE | `{ congresoId }` | `{ publicado, sesiones: [{ id, titulo, ponente, sala, inicio, fin, aforo, plazasLibres, completa, enAgenda, empezada }] }` |
| `anadir` | mutation | ASISTENTE | `{ sesionId }` | `{ ok }` |
| `quitar` | mutation | ASISTENTE | `{ sesionId }` | `{ ok }` |
| `mia` | query | ASISTENTE | `{ congresoId }` | `[{ sesionId, titulo, sala, inicio, fin, empezada, solapaCon: string[] }]` ordenada por hora |

| Código | Cuándo | Mensaje |
|--------|--------|---------|
| `FORBIDDEN` | sin inscripción confirmada en el congreso | «Necesitas una inscripción confirmada en este congreso» |
| `CONFLICT` | programa en borrador | «El programa aún no se ha publicado» |
| `CONFLICT` | sesión empezada (añadir) | «La sesión ya ha empezado» |
| `CONFLICT` | ya en la agenda | «Esta sesión ya está en tu agenda» |
| `CONFLICT` | solape | «Se solapa con «{título}» de {HH:mm} a {HH:mm}» |
| `CONFLICT` | aforo | «Aforo completo» |
| `CONFLICT` | quitar sesión empezada | «La sesión ya ha empezado: no se puede quitar de la agenda» |
| `NOT_FOUND` | quitar algo que no está en la agenda | «Esta sesión no está en tu agenda» |
