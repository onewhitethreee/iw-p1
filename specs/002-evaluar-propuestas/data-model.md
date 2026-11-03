# Data Model: Evaluar propuestas (spec-002)

**Sin entidades ni migraciones nuevas** (Constitución V). Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `Propuesta` | Estados `ENVIADA → EN_EVALUACION → ACEPTADA/RECHAZADA`; `decididaEn` al decidir |
| `Asignacion` | `(propuestaId, evaluadorId)` único; evaluador ≠ autor; **permanente** (clarify P1) |
| `Evaluacion` | Una por asignación; `puntuacion` entero 1–10 (CHECK en BD); `comentarios` 10–2000; modificable hasta la decisión |
| `Usuario`/`UsuarioRol` | Evaluador con rol `COMITE` (global, 000-core P4); organizador con `ORGANIZADOR` |

## Transiciones (A1, reglas de `packages/domain/propuesta.ts`)

| Desde | Acción | Hacia | Regla |
|-------|--------|-------|-------|
| ENVIADA | asignar evaluador | EN_EVALUACION | `estadoTrasAsignar` |
| EN_EVALUACION | asignar otro | EN_EVALUACION | idem |
| EN_EVALUACION | aceptar / rechazar | ACEPTADA / RECHAZADA | `puedeDecidir(estado, nEvaluaciones ≥ 2)` |
| ACEPTADA / RECHAZADA | cualquiera | — | final: asignar, evaluar y decidir → `CONFLICT` |

## Vista anónima (lo único que ve el comité)

`asignacionId`, `propuesta.{titulo, resumen, estado, area.nombre, congreso.nombre}`, y **su propia** evaluación (`puntuacion`, `comentarios`). Nunca `autorId`, `autor`, ni evaluaciones de otros.
