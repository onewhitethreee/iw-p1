# Informe `/speckit-clarify` · spec-003 (HU-03 Programa) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-003`
- **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-1.md`](spec-antes-clarify-1.md) · diferencia: [`clarify-1.diff`](clarify-1.diff)
- **Instrucción**: «Revisa las ambigüedades de la historia HU-03 (spec-003, montar y publicar el programa), especialmente quién puede realizar cada acción, qué datos son válidos, qué ocurre ante estados incompatibles y qué exige el posicionamiento en buscadores. Formula las preguntas necesarias para concretar criterios de aceptación verificables.»

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P1 | ¿Qué puede cambiar el organizador en sesiones ya empezadas o congresos terminados? | Congreso finalizado: bloqueado. Sesión empezada: solo cambiar de sala | Cambiar horario o quitar una sesión empezada falsearía asistencias y certificados (HU-06/07); cambiar de sala sobre la marcha es el ejemplo de la narrativa (HU-08) | FR-012, FR-013, US2 escenarios 5–6 | Recomendada, por delegación del responsable |
| P2 | ¿En qué zona horaria se introducen las horas? | En la del congreso | Coherencia con 000-core (fechas mostradas en la zona del congreso) | FR-014, Edge Cases | Recomendada, por delegación |

## Criterios en formato Dado… Cuando… Entonces…

- **P1**: *Dado* una sesión que empezó hace 10 minutos, *cuando* el organizador cambia su hora, *entonces* se rechaza («La sesión ya ha empezado: solo se puede cambiar de sala»); *cuando* la cambia a una sala libre con aforo suficiente, *entonces* se acepta. *Dado* un congreso finalizado, *cuando* intenta programar, mover o quitar, *entonces* se rechaza.
- **P2**: *Dado* un congreso en Europe/Madrid en julio, *cuando* el organizador programa a las 10:00, *entonces* se guarda 08:00 UTC y la página pública muestra «10:00».

## Checklist de calidad · Cobertura

17/17 → 17/17. Estados incompatibles: Resolved (P1) · Datos válidos: Resolved (P2) · SEO: Clear (FR-009, SC-002, SC-003) · Permisos: Clear (FR-001) · Solapes: Clear (A7) · Marcadores: 0.
