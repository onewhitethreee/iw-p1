# Contrato: router `panel` (spec-008)

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `resumen` | query | ORGANIZADOR | `{ congresoId }` | `{ calculadoEn, inscripciones: { confirmadas, pendientes }, ingresosCent, desglose: [{ tipoAsistente, tarifa, confirmadas, pendientes, ingresosCent }] (6 filas), sesiones: [{ id, titulo, sala, inicio, fin, aforo, reservas, asistencias, ocupacion, nivel, movible }] }` |
| `salasLibres` | query | ORGANIZADOR | `{ sesionId }` | `[{ id, nombre, aforo }]` |
| `cambiarSala` | mutation | ORGANIZADOR | `{ sesionId, salaId }` | `{ sesionId, sala, aforo }` |

| Situación | Error |
|-----------|-------|
| Sin rol ORGANIZADOR | `FORBIDDEN` |
| Congreso o sesión inexistente; sala de otro congreso | `NOT_FOUND` |
| Congreso finalizado | `CONFLICT` «El congreso ha finalizado: el programa ya no se puede cambiar» |
| Sesión terminada | `CONFLICT` «La sesión ya ha terminado» |
| Misma sala | `CONFLICT` «La sesión ya está en esa sala» |
| Solape en la sala destino | `CONFLICT` «La sala «X» ya tiene «título» de HH:mm a HH:mm» |
| Aforo insuficiente | `CONFLICT` «La sala «X» tiene aforo N y la sesión ya tiene M personas (reservas o asistencias)» |
