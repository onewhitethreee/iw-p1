# Informe `/speckit-analyze` · spec-003 · iteración 1 (inicial, antes de corregir)

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-003`
- **Instrucción**: «Revisa la coherencia entre spec.md, plan.md y tasks.md de spec-003 (y su contrato, data-model y la base 000-core). Presta atención a criterios sin tareas, tareas sin requisito, reglas contradictorias y dependencias con otras historias (spec-002, 005, 006, 008). Informa de la gravedad y de los documentos afectados.»

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| C1 | Constitución V | CRITICAL | contracts/programa.md vs 000-core/contracts/trpc-api.md | Firma de `programar`/`mover` redefinida (`dia`/`horaInicio`/`horaFin`) y procedimientos nuevos (`sesiones`, `sesionPublica`) sin actualizar el contrato compartido; spec-008 reutiliza `mover` | Actualizar 000-core primero |
| A1 | Contradicción | HIGH | spec.md Edge Cases vs plan (entrada de horario) | La spec permite sesiones que cruzan la medianoche; el modelo de entrada no puede expresarlas y T006(f) rechaza fin ≤ inicio | Decisión funcional → volver a clarify |
| X1 | Constitución V (spec-002) | MEDIUM | spec-002/contracts/evaluacion.md | `miembrosComite` añadido sin actualizar 000-core (no detectado en el analyze de spec-002) | Corregir en la rama spec-002 |
| S1 | Estilo | LOW | spec.md FR | FR-012–014 insertados antes de FR-009 | Reordenar |

Métricas: 14 FR + 4 SC · 20 tareas · cobertura 100 % (SC-004 manual) · ambigüedades 1 · duplicados 0 · críticos 1.
