# Contrato: router `programa` (spec-003)

Concreta las filas `programa.*` de [000-core/contracts/trpc-api.md](../../000-core/contracts/trpc-api.md) y añade `sesiones` (vista del organizador).
Horario de entrada: `{ dia: "AAAA-MM-DD", horaInicio: "HH:mm", horaFin: "HH:mm" }` en la zona del congreso (clarify P2).

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `pendientes` | query | ORGANIZADOR | `{ congresoId }` | `[{ propuestaId, titulo, autor: {nombre}, area: {nombre} }]` (ACEPTADA sin sesión) |
| `sesiones` | query | ORGANIZADOR | `{ congresoId }` | `[{ id, inicio, fin, sala: {id, nombre, aforo}, propuesta: {titulo, autor: {nombre}}, reservas, asistencias }]` |
| `programar` | mutation | ORGANIZADOR | `{ propuestaId, salaId, dia, horaInicio, horaFin }` | `{ id }` |
| `mover` | mutation | ORGANIZADOR | `{ sesionId, salaId?, dia?, horaInicio?, horaFin? }` | `{ id }` |
| `quitar` | mutation | ORGANIZADOR | `{ sesionId }` | `{ ok }` |
| `publicar` | mutation | ORGANIZADOR | `{ congresoId }` | `{ estadoPrograma: "PUBLICADO", publicadoEn }` |
| `publico` | query | P | `{ slug }` | `{ congreso, publicado: false }` o `{ congreso, publicado: true, dias: [{ dia, sesiones: [...] }] }` |
| `sesionPublica` | query | P | `{ slug, sesionId }` | sesión con resumen, ponente, sala y horario; `NOT_FOUND` si no existe o el programa no está publicado |

## Errores (mensajes)

| Código | Cuándo | Mensaje |
|--------|--------|---------|
| `CONFLICT` | propuesta no aceptada | «Solo se pueden programar ponencias aceptadas» |
| `CONFLICT` | ya programada | «Esta ponencia ya está programada» |
| `CONFLICT` | solape de ponente | «{Ponente} ya tiene la sesión «{título}» de {HH:mm} a {HH:mm}» |
| `CONFLICT` | solape de sala | «La sala {sala} está ocupada por «{título}» de {HH:mm} a {HH:mm}» |
| `BAD_REQUEST` | fin ≤ inicio | «La hora de fin debe ser posterior a la de inicio» |
| `BAD_REQUEST` | fuera del congreso | «La sesión debe estar dentro de las fechas del congreso» |
| `BAD_REQUEST` | sala de otro congreso | «La sala no pertenece a este congreso» |
| `CONFLICT` | aforo < reservas | «La sala {sala} tiene aforo {n} y la sesión tiene {m} reservas» |
| `CONFLICT` | quitar con reservas/asistencias | «No se puede quitar: la sesión tiene {m} reservas y {k} asistencias» |
| `CONFLICT` | congreso finalizado | «El congreso ha finalizado: el programa ya no se puede modificar» |
| `CONFLICT` | sesión empezada (horario o quitar) | «La sesión ya ha empezado: solo se puede cambiar de sala» |
| `FORBIDDEN` / `UNAUTHORIZED` | rol / sesión | mensajes de 000-core |
