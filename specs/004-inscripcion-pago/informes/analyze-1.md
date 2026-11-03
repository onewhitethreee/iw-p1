# Informe `/speckit-analyze` · spec-004 · iteración 1 (inicial, antes de corregir)

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-004`

| ID | Categoría | Gravedad | Ubicación | Resumen | Recomendación |
|----|-----------|----------|-----------|---------|---------------|
| C1 | Constitución V | CRITICAL | contracts/inscripcion.md vs 000-core/contracts/trpc-api.md | Firma de `presupuesto` distinta (`{congresoId, tipoAsistente}` → importe vs `{congresoId}` → 3 tipos); mismo patrón que C1 de spec-003 | Actualizar 000-core primero |
| T1 | Trazabilidad | MEDIUM | tasks.md T004(e)(f), T011 vs spec US1-6/US1-7 | Numeración de escenarios desfasada desde que 000-core analyze I2 insertó US1-6 | Renumerar |

Métricas: 13 FR + 3 SC · 12 tareas · cobertura 100 % (SC-001 manual) · ambigüedades 0 · duplicados 0 · críticos 1.

**Lección**: dos specs seguidas (003, 004) concretaron firmas del contrato compartido sin actualizar 000-core. Desde spec-005 se revisa el contrato de 000-core al hacer `/speckit-plan`.
