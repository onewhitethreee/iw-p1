# Research: Agenda personal (spec-005)

**Fecha**: 2026-11-03 · Sin `NEEDS CLARIFICATION`.

- **R1 Concurrencia** — Decisión: bloqueo inscripción → sesión con `FOR UPDATE` dentro de una transacción. Motivo: SC-002 (aforo) y solapes de la misma persona con dos clics rápidos. Alternativas: `Serializable` + reintentos; restricción de BD (no expresa «count ≤ aforo»).
- **R2 Orden de validación** — Decisión: del motivo más general al más concreto, para que el mensaje sea el más útil.
- **R3 Aviso de solapes** — Decisión: cálculo al leer. Alternativa: marcar en BD al mover la sesión (acopla spec-003 con spec-005).
- **R4 Quitar** — Decisión: rechazar si la sesión empezó (afectaría a HU-07).
- **R5 Contrato** — Decisión: añadir `agenda.congresos` (punto de entrada) y documentar el aviso en `agenda.mia` en el contrato de 000-core (lección de los hallazgos C1 de spec-003 y spec-004).
