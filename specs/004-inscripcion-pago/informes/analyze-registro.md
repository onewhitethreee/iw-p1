# Registro de hallazgos `/speckit-analyze` · spec-004

Responsable: Yangfeng Liu · Revisor: autorrevisión diferida · Inicial: [analyze-1.md](analyze-1.md) · Final: [analyze-2.md](analyze-2.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| C1 | Contrato compartido (Constitución V) | CRITICAL | `presupuesto` con firma distinta en 000-core | Fila de 000-core actualizada; se adopta revisar el contrato de 000-core en cada `/speckit-plan` | Yangfeng Liu | Cerrado |
| T1 | US1-6/US1-7 | MEDIUM | Numeración desfasada | Renumerado en T004, T006, T011, trazabilidad y quickstart | Yangfeng Liu | Cerrado |

### Iteración tras clarify-2 (2026-11-05) · inicial [analyze-3.md](analyze-3.md) · final [analyze-4.md](analyze-4.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| A1 | FR-014 · T014 ↔ plan R7 | MEDIUM | T014 pedía índice parcial y bloqueo | T014 reescrita según el plan (misma fila, `updateMany` atómicos) | Yangfeng Liu | Cerrado |
| A2 | US2-6 | MEDIUM | La spec describía dos filas | US2-6 redactada por lo observable; la decisión de P4 no cambia (no vuelve a clarify) | Yangfeng Liu | Cerrado |
| A3 | FR-011 | MEDIUM | «Inmutables una vez creada» frente a la reactivación | FR-011 precisado: inmutables mientras no se cancele | Yangfeng Liu | Cerrado |
| A4 | FR-014 · prueba (h) | MEDIUM | La prueba (h) exige que no exista `cancelar` | Se actualiza en T014; el criterio lo cambió clarify-2 P4, no es rebajarlo | Yangfeng Liu | Cerrado |
| A5 | Plan dec. 9 · T015 | MEDIUM | T015 no cubría la página de inscripción ni el pago | T015 ampliada | Yangfeng Liu | Cerrado |
| A6 | Trazabilidad | LOW | Sin FR-014 | Fila añadida | Yangfeng Liu | Cerrado |

