# Data Model: Programa del congreso (spec-003)

**Sin entidades ni migraciones nuevas** (Constitución V). Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `Sesion` | Se crea/mueve/quita. `propuestaId` único (una sesión por ponencia), `salaId`, `inicio < fin` dentro de `[congreso.inicio, congreso.fin]` |
| `Propuesta` | Solo `ACEPTADA` se programa; su `autor` es el ponente de la sesión |
| `Sala` | `aforo` determina el aforo de la sesión (A6) |
| `Congreso` | `estadoPrograma` (`BORRADOR → PUBLICADO`), `publicadoEn`, `zonaHoraria`, `inicio`/`fin` |
| `EntradaAgenda`, `Asistencia` | Solo lectura: impiden quitar (FR-007) y limitan el cambio a salas pequeñas (FR-006) |

## Invariantes que garantiza esta historia (A7)

- Ninguna sala tiene dos sesiones solapadas `[inicio, fin)`.
- Ningún autor tiene dos sesiones solapadas.

## Estados

| Programa | Público ve | Organizador puede |
|----------|------------|-------------------|
| `BORRADOR` | «El programa aún no se ha publicado» | programar, mover, quitar, publicar |
| `PUBLICADO` | sesiones | programar, mover, quitar (cambios visibles al instante) |

| Situación (clarify P1) | Restricción |
|-------------------------|-------------|
| `ahora ≥ congreso.fin` | nada se puede programar, mover ni quitar |
| `sesion.inicio ≤ ahora` | solo cambiar de sala |
