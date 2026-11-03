# Informe `/speckit-clarify` · spec-007 (HU-07 Certificado) · iteración 1

- **Fecha**: 2026-11-03 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-007` · diferencia: [clarify-1.diff](clarify-1.diff)

| # | Pregunta | Respuesta | Justificación | Criterios | Decidido por |
|---|----------|-----------|---------------|-----------|--------------|
| P1 | ¿Quién puede ver y descargar el certificado? | Solo el titular de la inscripción confirmada, con cualquier rol; tampoco el organizador | Mínimo que pide la historia; protege los datos personales (Constitución VII) | US1-6, FR-005 | Recomendada, por delegación |
| P2 | ¿Cómo se muestra un porcentaje no entero? | Truncado a entero hacia abajo | Nunca se muestra «80 %» a quien no llega; la decisión usa la comparación exacta | FR-003, Edge Cases | Recomendada, por delegación |

**Criterios**: *Dado* un organizador, *cuando* pide el PDF de otra persona, *entonces* se rechaza. *Dado* 2 de 3 sesiones, *cuando* abre «Certificado», *entonces* ve «66 %».

**Cobertura**: alcance, roles (resuelto), datos (claro: agenda + asistencias de 000-core), estados (claro: no finalizado, agenda vacía, sin inscripción), formato (resuelto), rendimiento (SC-002 claro), seguridad (resuelto). Sin pendientes.

Checklist 17/17 → 17/17.
