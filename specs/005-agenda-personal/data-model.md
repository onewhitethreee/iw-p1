# Data Model: Agenda personal (spec-005)

**Sin entidades ni migraciones nuevas.** Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `EntradaAgenda` | Reserva `(inscripcionId, sesionId)` única; se crea al añadir y se borra al quitar |
| `Inscripcion` | Debe estar `CONFIRMADA` en el congreso de la sesión |
| `Sesion` / `Sala` | Intervalo `[inicio, fin)` (A7) y aforo de la sala (A6) |
| `Congreso` | `estadoPrograma` debe ser `PUBLICADO` |

**Invariantes**: ninguna inscripción con dos entradas solapadas creadas por el sistema; `count(EntradaAgenda de la sesión) ≤ sala.aforo`.
