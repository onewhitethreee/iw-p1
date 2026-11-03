# Contrato: router `evaluacion` (spec-002)

Concreta las filas `evaluacion.*` de [000-core/contracts/trpc-api.md](../../000-core/contracts/trpc-api.md) y añade `miembrosComite` (necesario para elegir evaluador).

| Procedimiento | Tipo | Acceso | Entrada | Salida | Errores |
|---------------|------|--------|---------|--------|---------|
| `misAsignaciones` | query | COMITE | `{ congresoId? }` | `[{ asignacionId, evaluada, puntuacion?, propuesta: { titulo, estado, area: {nombre}, congreso: {nombre, slug} } }]` (vista anónima) | — |
| `detalle` | query | COMITE | `{ asignacionId }` | `{ asignacionId, propuesta: { titulo, resumen, estado, area, congreso }, evaluacion: { puntuacion, comentarios } \| null }` | `FORBIDDEN` «No tienes asignada esta propuesta» |
| `evaluar` | mutation | COMITE | `{ asignacionId, puntuacion: int 1–10, comentarios: 10–2000 }` | `{ ok }` | `FORBIDDEN`; `CONFLICT` «La propuesta ya está decidida»; `BAD_REQUEST` datos |
| `miembrosComite` | query | ORGANIZADOR | — | `[{ id, nombre }]` | — |
| `asignar` | mutation | ORGANIZADOR | `{ propuestaId, evaluadorId }` | `{ estado }` | `NOT_FOUND` propuesta; `BAD_REQUEST` «El usuario no pertenece al comité científico»; `CONFLICT` «Un evaluador no puede evaluar su propia propuesta» / «Ese evaluador ya tiene asignada esta propuesta» / «La propuesta ya está decidida» |
| `resumenOrganizador` | query | ORGANIZADOR | `{ congresoId }` | `[{ id, titulo, estado, area, autor: {nombre}, nEvaluaciones, media \| null, evaluadores: [{ nombre, evaluada }] }]` | — |
| `decidir` | mutation | ORGANIZADOR | `{ propuestaId, decision: ACEPTAR \| RECHAZAR }` | `{ estado }` | `NOT_FOUND`; `CONFLICT` «Se necesitan al menos 2 evaluaciones (tiene N)» / «La propuesta ya está decidida» / «La propuesta todavía no tiene evaluadores asignados» |

**No existen** (clarify P1): `quitarAsignacion`, ni operaciones para borrar evaluaciones.
