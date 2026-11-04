# Registro de hallazgos `/speckit-analyze` · spec-006

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| H1 | FR-009 vs A6 (spec-005) | HIGH | La reserva no garantizaba la plaza | Vuelta a clarify (P3) y actualización de spec, plan, contrato y T003 | Yangfeng Liu | Cerrado |
| N1 | FR-003 | LOW | sin remisión a FR-009 | Añadida | Yangfeng Liu | Cerrado |
| N2 | contrato 000-core | LOW | motivo P3 ausente | Añadido | Yangfeng Liu | Cerrado |

### Iteración tras clarify-3 (2026-11-05) · inicial [analyze-3.md](analyze-3.md) · final [analyze-4.md](analyze-4.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| A1 | FR-009 / P3 · prueba (h2) | MEDIUM | `AHORA` = inicio + 10 min coincide con el límite nuevo | (h2) pasa a +5 min y se añade (k) para el límite; P3 se sigue probando antes del límite | Yangfeng Liu | Cerrado |
| A2 | FR-011 · T012 | MEDIUM | El bloqueo de la sesión no serializa dos sesiones | T012 con bloqueo de la inscripción y prueba concurrente (m) | Yangfeng Liu | Cerrado |
| A3 | FR-011 ↔ spec-005 R1 | MEDIUM | Orden de bloqueo contrario al de `agenda.anadir` | Orden común inscripción → sesión; prueba (n) | Yangfeng Liu | Cerrado |
| A4 | Trazabilidad | LOW | Sin FR-011 ni FR-009 matizada | Filas añadidas | Yangfeng Liu | Cerrado |
