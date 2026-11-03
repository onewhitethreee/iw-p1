# Data Model: Certificado de asistencia (spec-007)

**Sin entidades ni migraciones nuevas.** Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `Inscripcion` | La del usuario en el congreso `(congresoId, usuarioId)`; debe estar `CONFIRMADA` |
| `EntradaAgenda` | Sesiones de la agenda = denominador |
| `Asistencia` | Asistencias registradas en la puerta (spec-006) a sesiones de la agenda = numerador |
| `Sesion` | `inicio`/`fin` para las horas; título, sala y fecha en el PDF |
| `Congreso` | `fin` (disponibilidad), `nombre`, `sede`, `inicio`, `zonaHoraria` |
| `Usuario` | `nombre` del titular en el PDF |

**Valor calculado** `EstadoCertificado`: `{ estado: DISPONIBLE | NO_FINALIZADO | AGENDA_VACIA | BAJO_UMBRAL | SIN_INSCRIPCION, disponible, motivo, porcentaje (entero truncado), asistidas, total, horas: { minutos, texto }, sesiones: [{ id, titulo, sala, inicio, fin, asistida }] }`.

**Reglas**: `disponible ⇔ CONFIRMADA ∧ ahora ≥ fin ∧ total > 0 ∧ asistidas × 100 ≥ 80 × total`.
