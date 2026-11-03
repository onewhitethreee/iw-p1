# Fase 1 y 2 · Estado y siguientes pasos

Responsable: Yangfeng Liu (grupo de un integrante).

## Hecho (2026-11-03)
- [x] Historias HU-01…HU-08 revisadas (`docs/historias-usuario.md`).
- [x] Reparto y acuerdos A1–A10 cerrados (`docs/agrupamiento.md`).
- [x] Constitución 1.1.0 adaptada a un integrante (`.specify/memory/constitution.md`).
- [x] Spec común `specs/000-core`: spec, plan, research, data-model, contrato tRPC y quickstart.
- [x] 8 specs `specs/001…008` con su checklist de calidad.
- [x] Ramas `spec-001` … `spec-008` creadas desde `main`.

## Siguiente: ciclo por spec (en su rama)
```
git switch spec-001
/speckit-clarify    → registrar preguntas y respuestas (evidencia 5.1)
/speckit-plan       → plan de la historia, respetando 000-core
/speckit-tasks
/speckit-analyze    → guardar el primer informe antes de corregir (evidencia 5.2)
/speckit-implement
/speckit-converge   → guardar los informes (evidencia 5.3)
```
Para que los comandos trabajen sobre la spec correcta, actualizad `.specify/feature.json`
(`{"feature_directory": "specs/001-enviar-propuesta"}`) al cambiar de rama.

Orden recomendado: implementar primero el andamiaje de 000-core en `main` (monorepo, Prisma, auth, seed),
después 001 → 008.
