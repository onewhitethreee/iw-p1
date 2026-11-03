# Informe `/speckit-clarify` · spec-006 (HU-06 Acceso QR) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-006` · diferencia: [clarify-1.diff](clarify-1.diff)

| # | Pregunta | Respuesta | Justificación | Criterios | Decidido por |
|---|----------|-----------|---------------|-----------|--------------|
| P1 | ¿Hace falta tener la sesión en la agenda para entrar? | No | La narrativa controla el aforo de la sala; el certificado solo cuenta la agenda | FR-009, Assumptions | Recomendada, por delegación |
| P2 | ¿Ventana de escaneo? | 30 min antes del inicio → fin | Cola previa sin falsear asistencias a sesiones terminadas | FR-010, Assumptions | Recomendada, por delegación |

**Criterios**: *Dado* un asistente confirmado sin la sesión en su agenda, *cuando* se escanea con aforo disponible, *entonces* se admite. *Dado* 31 min antes del inicio, *cuando* se escanea, *entonces* «La sesión aún no está abierta (se abre a las HH:mm)».

Checklist 17/17 → 17/17.
