# Research: Programa del congreso (spec-003)

**Fecha**: 2026-11-03 · Sin `NEEDS CLARIFICATION`. Las decisiones generales están en [000-core/research.md](../000-core/research.md).

## R1. Concurrencia al programar
- **Decisión**: bloqueo de la fila `Congreso` (`FOR UPDATE`) al inicio de `programar`/`mover`/`quitar`.
- **Motivo**: los solapes de sala y de ponente dependen de varias filas `Sesion`; bloquear el congreso serializa los cambios de su programa con una sola sentencia.
- **Alternativas**: restricción de exclusión `btree_gist` (solo cubre la sala, no el ponente); aislamiento `Serializable` (reintentos).

## R2. Detección de solapes
- **Decisión**: consulta de sesiones del congreso con `OR [{ salaId }, { propuesta: { autorId } }]` y `primerSolape` del dominio; primero se informa del ponente, después de la sala.
- **Motivo**: reutiliza la regla A7 probada y produce mensajes que identifican la sesión (FR-008).

## R3. Horas en la zona del congreso (clarify P2)
- **Decisión**: `instanteLocal("2027-04-20T10:00", "Europe/Madrid")` en `packages/domain/src/fechas.ts`, implementado con el mismo cálculo de desfase que `inicioDeDia`.
- **Alternativas**: `<input type="datetime-local">` convertido en el navegador (dependería de la zona del organizador, lo que P2 descarta).

## R4. Renderizado de las páginas públicas
- **Decisión**: Server Components con `dynamic = "force-dynamic"`.
- **Motivo**: HTML completo en el servidor (SEO) y cambios visibles al instante, sin gestionar revalidación (Constitución I).
- **Alternativas**: ISR + `revalidatePath` al publicar/mover (más eficiente, pero añade acoplamiento con el router y casos de error).

## R5. SEO
- **Decisión**: metadatos por página, URL canónica, Open Graph, JSON-LD `schema.org/Event` (congreso con `subEvent` de cada sesión: `name`, `startDate`, `endDate`, `location`, `performer`), `sitemap.xml` y `robots.txt`.
- **Verificación**: Lighthouse (categoría SEO) con el Chromium preinstalado; comprobación del HTML con `fetch` sin JavaScript.

## R6. Fecha de publicación
- **Decisión**: `publicar` fija `estadoPrograma = PUBLICADO` y `publicadoEn = ahora`; publicar de nuevo es idempotente (no cambia `publicadoEn`).
