# Registro de hallazgos `/speckit-analyze` · spec-001

Responsable: Yangfeng Liu · Revisor: autorrevisión diferida · Inicial: [analyze-1.md](analyze-1.md) · Final: [analyze-2.md](analyze-2.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| D1 | HU-01 US2 (Constitución III) | CRITICAL | US2 sin caso de error/límite | Escenario US2-5 (lista vacía), trazado a T011/T012 y quickstart | Yangfeng Liu | Cerrado |
| T1 | Edge Cases | MEDIUM | «clarify P1» ambiguo | «clarify de 000-core P1» | Yangfeng Liu | Cerrado |
| C1 | US1-6 | LOW | e2e sin caso anónimo | Añadido a T008 | Yangfeng Liu | Cerrado |
| C2 | SC-001 | LOW | sin tarea | Medición manual en T014 | Yangfeng Liu | Cerrado (justificado: tiempo de usuario, no automatizable con sentido) |
| N1 | quickstart (analyze-2) | LOW | Numeración 7b/7 | Renumerado | Yangfeng Liu | Cerrado |

### Iteración tras clarify-2 (2026-11-05) · inicial [analyze-3.md](analyze-3.md) · final [analyze-4.md](analyze-4.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| A1 | FR-011 · T016 ↔ plan dec. 6 / R6 | MEDIUM | T016 (escrita en clarify) pedía un bloqueo en el código; el plan decide un índice único | T016 reescrita según el plan: prueba primero, migración e `P2002` → `CONFLICT`. Se mantiene el plan: la base de datos garantiza la regla también con envíos simultáneos | Yangfeng Liu | Cerrado |
| A2 | FR-011 · US1-7 | MEDIUM | Matriz de trazabilidad sin FR-011 | Fila añadida (T016, T017) | Yangfeng Liu | Cerrado |
| A3 | FR-006 | LOW | FR-006 no incluía FR-011 | FR-006 ampliado. No es una decisión funcional nueva (FR-011 ya era de servidor), por eso no vuelve a clarify | Yangfeng Liu | Cerrado |
| A4 | US1-7 · quickstart #9 | LOW | Sin prueba de interfaz | T017 e2e | Yangfeng Liu | Cerrado |
