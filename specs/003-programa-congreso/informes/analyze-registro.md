# Registro de hallazgos `/speckit-analyze` · spec-003

Responsable: Yangfeng Liu · Revisor: autorrevisión diferida · Inicial: [analyze-1.md](analyze-1.md) · Final: [analyze-2.md](analyze-2.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| C1 | Contrato compartido (Constitución V) | CRITICAL | `programar`/`mover` redefinidos y procedimientos nuevos sin reflejar en 000-core | Filas `programa.*` actualizadas en `specs/000-core/contracts/trpc-api.md` | Yangfeng Liu | Cerrado |
| A1 | Edge Cases vs plan | HIGH | Medianoche permitida en la spec, imposible en el plan | Vuelta a clarify (P3: no se permite); FR-003, Edge Cases y T006(f) actualizados | Yangfeng Liu | Cerrado |
| X1 | spec-002 contrato | MEDIUM | `evaluacion.miembrosComite` no está en el contrato de 000-core | Corregido en la rama `spec-002` (commit «spec-002: añade evaluacion.miembrosComite…») | Yangfeng Liu | Cerrado |
| S1 | spec FR | LOW | Orden de FR | Reordenado | Yangfeng Liu | Cerrado |
| N1 | data-model/plan (analyze-2) | LOW | Faltaba «mismo día» (P3) | Añadido | Yangfeng Liu | Cerrado |
