# Informe `/speckit-clarify` · spec-002 (HU-02 Evaluar propuestas) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-002`
- **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-1.md`](spec-antes-clarify-1.md) · diferencia: [`clarify-1.diff`](clarify-1.diff)
- **Instrucción**: «Revisa las ambigüedades de la historia HU-02 (spec-002, evaluar propuestas de forma anónima), especialmente quién puede realizar cada acción, qué datos son válidos y qué ocurre ante estados incompatibles. Formula las preguntas necesarias para concretar criterios de aceptación verificables.»

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P1 | Si un evaluador asignado no evalúa, ¿puede el organizador quitarle la asignación? | No; se asignan más evaluadores | La narrativa no lo pide; asignar otro evaluador ya desbloquea la propuesta (bastan 2 evaluaciones cualesquiera). | FR-010, Edge Cases | Recomendada, por delegación del responsable |
| P2 | ¿La decisión del organizador está sujeta a una nota mínima? | No; decide libremente viendo media y número | La narrativa no fija umbral; la decisión manual ya está en 000-core A1. | FR-011, US3 escenario 5 | Recomendada, por delegación |

## Criterios en formato Dado… Cuando… Entonces…

- **P1**: *Dado* una propuesta con un evaluador asignado que no evalúa, *cuando* el organizador asigna a otros dos que sí evalúan, *entonces* puede decidir; *cuando* busca quitar la primera asignación, *entonces* no existe esa operación.
- **P2**: *Dado* una propuesta con 2 evaluaciones y media 4,5, *cuando* el organizador la acepta, *entonces* queda `ACEPTADA`.

## Checklist de calidad · Cobertura

17/17 → 17/17. Alcance y roles: Resolved (P1) · Estados: Resolved (P2) · Anonimato/seguridad: Clear (FR-005) · Datos: Clear (A3) · Casos límite: Clear · Marcadores: 0.
