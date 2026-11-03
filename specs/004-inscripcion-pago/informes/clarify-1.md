# Informe `/speckit-clarify` · spec-004 (HU-04 Inscripción y pago) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-004` · diferencia: [clarify-1.diff](clarify-1.diff)

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P1 | ¿Cambiar tipo o cancelar una inscripción pendiente? | No (v1) | No lo pide la narrativa; evita recalcular tarifa y burlar el precio temprano | FR-011, Edge Cases | Recomendada, por delegación |
| P2 | ¿Inscripciones durante el congreso? | Sí, hasta que finaliza | El panel de HU-08 muestra inscripciones e ingresos en tiempo real durante el evento | FR-012, US1-4 | Recomendada, por delegación |
| P3 | ¿Datos de la pasarela simulada y rechazo? | 16 dígitos; rechaza solo 4000 0000 0000 0002; guarda solo los 4 últimos | Mínimo para demostrar aprobado/rechazo; Constitución VII | FR-013, Edge Cases | Recomendada, por delegación |

**Criterios**: *Dado* un congreso en curso, *cuando* un asistente se inscribe, *entonces* se acepta. *Dado* el número «1234», *cuando* paga, *entonces* se rechaza como dato no válido y no se crea pago. *Dado* «4111 1111 1111 1111», *cuando* paga, *entonces* se aprueba y la referencia termina en «1111».

Checklist 17/17 → 17/17 · Cobertura: estados Resolved (P1, P2) · datos válidos Resolved (P3) · seguridad Resolved (P3) · resto Clear.
