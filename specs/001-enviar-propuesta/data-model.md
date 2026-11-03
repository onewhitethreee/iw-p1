# Data Model: Enviar propuesta (spec-001)

**Sin entidades ni migraciones nuevas** (Constitución V). Se usan las de [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso en esta historia |
|---------|----------------------|
| `Propuesta` | Se crea con `congresoId`, `areaId`, `autorId` (= usuario de la sesión), `titulo` (5–200), `resumen` (100–3000), `estado = ENVIADA`, `enviadaEn = ahora` |
| `AreaTematica` | Debe pertenecer al `congresoId` de la propuesta |
| `Congreso` | `envioAbre`/`envioCierra` determinan el plazo (`[envioAbre, envioCierra)`, días completos, FR-005a) |
| `Usuario`/`UsuarioRol` | Debe tener rol `PONENTE` (o añadírselo, 000-core FR-003a) |

## Transición que produce esta historia

`(nada)` → `ENVIADA`. Las siguientes (`EN_EVALUACION`, `ACEPTADA`, `RECHAZADA`) son de spec-002; esta historia solo las **muestra**.

## Campos visibles para el autor (FR-010)

`titulo`, `resumen`, `estado`, `enviadaEn`, nombre del área, nombre/slug/zona del congreso. Nunca asignaciones, evaluaciones, puntuaciones ni evaluadores.
