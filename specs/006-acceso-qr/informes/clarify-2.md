# Informe `/speckit-clarify` · spec-006 · iteración 2 (por analyze H1)

| # | Pregunta | Respuesta | Justificación | Criterios | Decidido por |
|---|----------|-----------|---------------|-----------|--------------|
| P3 | ¿Puede quien no reservó ocupar plazas reservadas? | No: la reserva garantiza la plaza; sin reserva solo si quedan plazas sin reservar | Mantiene A6 («la agenda reserva plaza») sin exigir agenda para entrar (P1) | FR-009, Edge Cases, plan R2, contrato, T003(h2) | Recomendada, por delegación |

**Criterio**: *Dado* una sala de aforo 2 con 1 reserva y 1 asistente sin reserva dentro, *cuando* llega otro sin reserva, *entonces* «No quedan plazas sin reservar»; *cuando* llega el que reservó, *entonces* admitido. Diferencia: [clarify-2.diff](clarify-2.diff).
