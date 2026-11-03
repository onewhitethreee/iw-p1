# Data Model: Panel en tiempo real (spec-008)

**Sin entidades ni migraciones nuevas.** Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `Inscripcion` | Recuento por `estado` (`CONFIRMADA`/`PENDIENTE_PAGO`), `tipoAsistente` y `tarifaAplicada` |
| `Pago` | Ingresos = `SUM(importeCent)` de `resultado = APROBADO` (céntimos, enteros) |
| `Sesion` / `Sala` | Título (de la propuesta), horario, aforo; `salaId` es lo único que cambia `cambiarSala` |
| `EntradaAgenda` | Reservas por sesión |
| `Asistencia` | Asistencias por sesión; se mantienen al cambiar de sala (Edge Cases) |

**Valores calculados**: `ocupacion = floor(máx(reservas, asistencias) × 100 / aforo)`; `nivel = COMPLETA` si máx ≥ aforo, `CASI_COMPLETA` si máx × 100 ≥ 90 × aforo; `movible = congreso no finalizado ∧ ahora < fin de la sesión`.

**Invariantes al cambiar de sala**: sala destino del mismo congreso y distinta de la actual; sin solape con otra sesión de esa sala; `aforo destino ≥ máx(reservas, asistencias)`.
