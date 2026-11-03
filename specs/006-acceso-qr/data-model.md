# Data Model: Acceso con QR (spec-006)

**Sin entidades ni migraciones nuevas.** Usa [000-core/data-model.md](../000-core/data-model.md):

| Entidad | Uso |
|---------|-----|
| `Asistencia` | Se crea al admitir: `(inscripcionId, sesionId)` única, `registradaEn`, `registradaPorId` (personal) |
| `Inscripcion` | `codigoAcreditacion` (UUID) identifica al asistente; debe estar `CONFIRMADA` y ser del mismo congreso |
| `Sesion` / `Sala` | Ventana `[inicio − 30 min, fin)`; aforo = `sala.aforo` |

**Invariante**: `count(Asistencia de la sesión) ≤ sala.aforo` (SC-002).
