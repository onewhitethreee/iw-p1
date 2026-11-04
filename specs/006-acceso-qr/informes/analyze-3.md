# Informe `/speckit-analyze` · spec-006 · iteración 3 (tras clarify-3 y la revisión del plan)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-006-clarify-2`
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md después de clarify-3 P4 (sesiones solapadas) y de spec-005 P2 (vigencia de la reserva). Presta atención a criterios sin tareas, tareas sin requisito que las justifique, reglas contradictorias y dependencias entre historias. Informa de la gravedad y de los documentos afectados.»
- Informe **inicial**, conservado antes de corregir (§5.2 paso 2).

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| A1 | Inconsistencia (prueba) | MEDIUM | `tests/integration/006/fixtures.ts` (`AHORA = inicio + 10 min`) ↔ FR-009 matizada | La prueba (h2), que comprueba que las plazas reservadas quedan para quien reservó, se ejecuta justo en el minuto 10. Con FR-009 matizada, en ese momento ya **no** hay plazas reservadas: la prueba fallaría o, si se cambiara su resultado esperado, dejaría de probar P3. Ninguna tarea lo prevé | En T011: ejecutar (h2) a los 5 min y añadir la prueba del límite (10:09 / 10:10) |
| A2 | Inconsistencia | MEDIUM | tasks.md T012 ↔ plan decisión 3 / R3 | T012 dice «dentro del bloqueo», pero el bloqueo actual es de la **sesión** y no serializa dos puertas de sesiones distintas. El plan revisado añade el bloqueo de la inscripción en orden inscripción → sesión | Reescribir T012 con el bloqueo y el orden, y con una prueba concurrente |
| A3 | Dependencia | MEDIUM | plan R3 ↔ spec-005 R1 | Sin el orden común, `agenda.anadir` (inscripción → sesión) y `escanear` (sesión → inscripción) podrían interbloquearse entre −30 min y el inicio. Lo detectó la revisión del plan; tasks.md no lo recoge | Incluirlo en T012 y comprobarlo con una prueba de `anadir` ∥ `escanear` |
| A4 | Cobertura | LOW | tasks.md «Trazabilidad» | Faltan FR-011 y FR-009 matizada | Añadir filas |

**Comprobado sin hallazgos**

- Las tres sesiones del fixture se solapan (0–60 min), pero ninguna prueba existente escanea a la misma persona en dos de ellas, así que FR-011 no rompe ninguna. RC-1 (`integrado/recorridos.test.ts`) escanea sesiones separadas 2 h.
- FR-005 («ya registrado» antes que «aforo») y FR-011: el plan pone FR-011 después de «ya registrado», así que volver a entrar en la misma sesión sigue funcionando.
- Mensajes iguales en spec (US1-8), plan, contrato y quickstart.
- Spec-008: la ocupación usa asistencias y reservas; FR-011 solo evita asistencias imposibles.

Métricas: 11 FR + 3 SC · 12 tareas · cobertura 10/12 · CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 1.
