# Informe `/speckit-clarify` · spec-008 (HU-08 Panel) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-008` · diferencia: [clarify-1.diff](clarify-1.diff)

| # | Pregunta | Respuesta | Justificación | Criterios | Decidido por |
|---|----------|-----------|---------------|-----------|--------------|
| P1 | ¿Sobre qué cifra se marca «Completa»/«Casi completa»? | máx(reservas, asistencias) / aforo | Antes de la sesión mandan las reservas; durante, las asistencias | US2-1, FR-003 | Recomendada, por delegación |
| P2 | ¿Aforo mínimo de la sala nueva? | ≥ máx(reservas, asistencias) | Nunca superar el aforo con gente ya dentro (SC-002 de spec-006) | US3-1, FR-005 | Recomendada, por delegación |
| P3 | ¿Qué sesiones pueden cambiar de sala? | No terminadas de un congreso no finalizado | Coherente con spec-003 P1 (empezada → solo sala; finalizado → bloqueado) | US3-4 (nuevo), Edge Cases, FR-005 | Recomendada, por delegación |

**Criterios**: *Dado* 0 reservas y 2 asistencias en aforo 2, *cuando* se abre el panel, *entonces* «Completa». *Dada* una sesión con 3 asistencias, *cuando* se piden salas libres, *entonces* no aparece una de aforo 2. *Dada* una sesión terminada, *cuando* se pide cambiarla, *entonces* se rechaza.

**Cobertura**: alcance y roles claros (FR-001); datos resueltos (P1, P2); estados resueltos (P3); refresco claro (FR-004, A9); rendimiento claro (SC-004); errores claros (Edge «Sin actualizar»). Sin pendientes.

Checklist 17/17 → 17/17.
