# Informe `/speckit-clarify` · spec-001 (HU-01 Enviar propuesta) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` (skill `speckit-clarify`) · **Rama**: `spec-001`
- **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-1.md`](spec-antes-clarify-1.md) · diferencia: [`clarify-1.diff`](clarify-1.diff)
- **Responsable**: Yangfeng Liu · **Revisión**: autorrevisión diferida
- **Instrucción**: «Revisa las ambigüedades de la historia HU-01 (spec-001, enviar propuesta de ponencia), especialmente quién puede realizar cada acción, qué datos son válidos y qué ocurre ante estados incompatibles. Formula las preguntas necesarias para concretar criterios de aceptación verificables.»

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P1 | ¿Puede el ponente editar o retirar una propuesta ya enviada? | No en la versión 1 | La narrativa no lo pide (Constitución II); editar una propuesta en evaluación cambiaría lo que evalúa el comité. | FR-008, US2 escenario 4, Edge Cases, Assumptions | Recomendada, aceptada por delegación del responsable |
| P2 | ¿Cuántas propuestas puede enviar un ponente al mismo congreso? | Sin límite | La narrativa no fija límite; la selección la hace el comité. | FR-009, Edge Cases | Recomendada, por delegación |
| P3 | Cuando la propuesta se decide, ¿qué ve el ponente? | Solo el estado | La narrativa no pide devolución al autor; mostrar puntuaciones/comentarios sería alcance nuevo y facilita deducir quién evaluó. | FR-010, US2 escenario 3 | Recomendada, por delegación |

## Criterios en formato Dado… Cuando… Entonces…

- **P1**: *Dado* una propuesta enviada, *cuando* su autor intenta modificarla o retirarla (también con una petición directa), *entonces* no existe esa operación y la propuesta conserva sus datos.
- **P2**: *Dado* un ponente con 3 propuestas en un congreso con el plazo abierto, *cuando* envía una cuarta válida, *entonces* se acepta.
- **P3**: *Dado* una propuesta aceptada con dos evaluaciones, *cuando* su autor consulta «Mis propuestas», *entonces* ve «Aceptada» y la respuesta del servidor no contiene puntuaciones, comentarios ni evaluadores.

## Checklist de calidad

17/17 → 17/17 (sin cambios de estado).

## Cobertura

| Categoría | Estado |
|-----------|--------|
| Alcance y roles | Resolved (P1, P2) |
| Modelo de datos y estados | Clear (000-core FR-010) |
| Flujo e interacción | Clear |
| No funcionales | Clear (SC-001…SC-003) |
| Seguridad y privacidad | Resolved (P3) |
| Casos límite | Clear (último día del plazo, FR-005a) |
| Terminología | Clear |
| Marcadores pendientes | Clear (0) |

No se formulan más preguntas: el resto de dudas no cambia el diseño ni las pruebas.
