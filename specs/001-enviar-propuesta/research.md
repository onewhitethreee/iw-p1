# Research: Enviar propuesta (spec-001)

**Fecha**: 2026-11-03 · **Responsable**: Yangfeng Liu. No hay `NEEDS CLARIFICATION` en el Technical Context; se documentan las decisiones propias de la historia. Las generales están en [000-core/research.md](../000-core/research.md).

## R1. Elegir congreso y área sin procedimientos nuevos
- **Decisión**: reutilizar `congreso.listar` (filtrando `fase === "LLAMADA_ABIERTA"`) y `congreso.porSlug` (áreas).
- **Motivo**: Constitución I; los datos ya son públicos.
- **Alternativas**: `propuesta.congresosAbiertos` (duplicaría lógica de fase).

## R2. Formulario
- **Decisión**: react-hook-form + `zodResolver` con el esquema `propuestaSchema` de `src/lib/esquemas/propuesta.ts`, el mismo que valida `propuesta.enviar`.
- **Motivo**: formulario largo con contador de caracteres y validación inmediata (000-core R11 revisado); una sola fuente de reglas de longitud.
- **Alternativas**: `useActionState` (sin validación en cliente mientras se escribe el resumen).

## R3. Privacidad de `mias` (clarify P3)
- **Decisión**: `select` explícito de `id, titulo, resumen, estado, enviadaEn, area.nombre, congreso.{nombre, slug, zonaHoraria}`.
- **Motivo**: con `include` sería fácil filtrar asignaciones/evaluaciones por error; la prueba de integración comprueba las claves exactas.

## R4. Plazo con instante simulable
- **Decisión**: usar `ctx.ahora()` (ya existe en el contexto) para comprobar el plazo; las pruebas inyectan 23:59 del día de cierre y 00:00 del siguiente.
- **Motivo**: hace verificables los casos límite de FR-005a sin esperar al reloj real.

## R5. Mensajes de error
- **Decisión**: `CONFLICT` «El plazo de envío de propuestas de este congreso está cerrado» / «El plazo de envío de este congreso se abre el {día}»; `BAD_REQUEST` «El área temática no pertenece a este congreso»; `NOT_FOUND` «Congreso no encontrado».
