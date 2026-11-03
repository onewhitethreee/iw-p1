# Research: Evaluar propuestas (spec-002)

**Fecha**: 2026-11-03 · Sin `NEEDS CLARIFICATION`. Decisiones propias de la historia; las generales en [000-core/research.md](../000-core/research.md).

## R1. Cómo garantizar el anonimato en el servidor
- **Decisión**: un único `select` constante (`SELECT_ANONIMO`) para todo lo que ve el comité, sin `autorId` ni la relación `autor`; prueba de integración que serializa cada respuesta del comité y busca el nombre, el correo y el id del autor.
- **Motivo**: el riesgo real es un `include` olvidado; centralizar el `select` y probar el «rastro» cubre cambios futuros (SC-001).
- **Alternativas**: tabla/vista SQL anónima (más compleja de mantener con Prisma); filtrar en el cliente (prohibido, Constitución IV).

## R2. Respuesta ante asignaciones ajenas o inexistentes
- **Decisión**: `FORBIDDEN` «No tienes asignada esta propuesta» en ambos casos.
- **Motivo**: no revelar qué identificadores existen.

## R3. Asignación y cambio de estado
- **Decisión**: `db.$transaction` con `asignacion.create` + `propuesta.update({ estado: estadoTrasAsignar(estado) })`; error de unicidad de Prisma (`P2002`) → `CONFLICT` «Ese evaluador ya tiene asignada esta propuesta».

## R4. Decisiones y evaluaciones concurrentes (revisado tras analyze U1)
- **Decisión**: transacción interactiva con `SELECT id FROM "Propuesta" WHERE id = $1 FOR UPDATE` al inicio de `evaluar` y de `decidir`.
- **Motivo**: la versión inicial (`updateMany` condicionado) protegía decidir ∥ decidir, pero no evaluar ∥ decidir.
- **Alternativas**: `updateMany` condicionado (insuficiente, ver arriba); aislamiento `Serializable` (requiere reintentos).

## R5. Media
- **Decisión**: media calculada en el servidor con `aggregate` (`_avg`, `_count`), redondeada a 1 decimal y mostrada en es-ES («7,5»).
