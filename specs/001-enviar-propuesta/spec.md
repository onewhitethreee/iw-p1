# Feature Specification: Enviar propuesta de ponencia (HU-01)

**Feature Branch**: `spec-001`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-01 · Como ponente, quiero enviar una propuesta de ponencia con un resumen y su área temática para que el comité científico la valore."

## Clarifications

### Session 2026-11-03

- Q: ¿Puede el ponente editar o retirar una propuesta ya enviada? → A: No en la versión 1: una vez enviada, la propuesta no se puede editar ni retirar.
- Q: ¿Cuántas propuestas puede enviar un ponente al mismo congreso? → A: Sin límite.
- Q: Cuando la propuesta se decide, ¿qué ve el ponente? → A: Solo el estado (Enviada, En evaluación, Aceptada, Rechazada); nunca puntuaciones, comentarios ni evaluadores.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar una propuesta dentro del plazo (Priority: P1)

Un ponente elige un congreso con la llamada a comunicaciones abierta, rellena título, resumen y área temática
y envía la propuesta. El sistema la registra en estado `ENVIADA`.

**Why this priority**: sin propuestas no hay evaluación, programa ni congreso; es el inicio de todo el flujo.

**Independent Test**: con el congreso de ejemplo en llamada abierta, iniciar sesión como `ponente1`, enviar una propuesta y verla en «Mis propuestas».

**Acceptance Scenarios**:

1. **Given** un congreso con el plazo de envío abierto y un ponente con sesión iniciada, **When** envía una propuesta con título, resumen y un área del congreso, **Then** el sistema la guarda en estado `ENVIADA`, muestra una confirmación y la propuesta aparece en «Mis propuestas».
2. **Given** un congreso cuyo plazo de envío ya ha cerrado, **When** un ponente intenta enviar una propuesta (desde el formulario o con una petición directa al servidor), **Then** el sistema la rechaza con el mensaje «El plazo de envío de propuestas de este congreso está cerrado» y no guarda nada.
3. **Given** un congreso cuyo plazo aún no ha abierto, **When** un ponente intenta enviar una propuesta, **Then** el sistema la rechaza indicando el día de apertura.
4. **Given** un formulario con el resumen demasiado corto o sin área, **When** el ponente lo envía, **Then** el sistema indica qué campo no es válido y no guarda la propuesta.
5. **Given** un área temática que pertenece a otro congreso, **When** se envía la propuesta con ella (petición manipulada), **Then** el sistema la rechaza como área no válida.
6. **Given** un usuario sin el rol ponente (p. ej. un asistente) o sin sesión, **When** intenta enviar una propuesta, **Then** el sistema la rechaza (sin sesión, le pide iniciarla).

---

### User Story 2 - Consultar mis propuestas y su estado (Priority: P2)

El ponente ve la lista de sus propuestas con congreso, título, área, fecha de envío y estado
(`Enviada`, `En evaluación`, `Aceptada`, `Rechazada`).

**Why this priority**: da seguimiento al ponente, pero el valor principal es el envío.

**Independent Test**: con los datos de ejemplo, `ponente1` ve propuestas suyas en distintos estados y ninguna de otro ponente.

**Acceptance Scenarios**:

1. **Given** un ponente con propuestas en varios estados, **When** abre «Mis propuestas», **Then** ve todas las suyas con su estado actual, ordenadas de la más reciente a la más antigua.
2. **Given** dos ponentes, **When** uno abre «Mis propuestas», **Then** no ve ninguna propuesta del otro.
3. **Given** una propuesta en evaluación o ya decidida (aceptada o rechazada), **When** su autor la consulta, **Then** ve solo el estado; ni la pantalla ni la respuesta del servidor incluyen puntuaciones, comentarios ni identidad de los evaluadores.
4. **Given** una propuesta enviada, **When** su autor intenta modificarla o retirarla (también con una petición directa), **Then** no existe esa operación y la propuesta conserva sus datos.
5. **Given** un ponente que todavía no ha enviado ninguna propuesta, **When** abre «Mis propuestas», **Then** ve el mensaje «Todavía no has enviado ninguna propuesta» y el botón «Enviar propuesta», sin errores.

### Edge Cases

- Último día del plazo (000-core FR-005a, clarify de 000-core P1): el plazo incluye el día de cierre completo en la zona del congreso; un envío a las 23:59 del día de cierre se acepta y uno a las 00:00 del día siguiente se rechaza. Cuenta la hora del servidor.
- Dos envíos idénticos seguidos por doble clic: el botón se desactiva mientras se envía; si aun así llegan dos, se guardan como dos propuestas (no hay regla de unicidad en la narrativa).
- Un ponente puede enviar varias propuestas al mismo congreso, sin límite (Clarifications P2).
- Una vez enviada, la propuesta no se puede editar ni retirar (Clarifications P1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir a un usuario con rol `PONENTE` enviar una propuesta indicando congreso, título (5–200 caracteres), resumen (100–3000 caracteres) y área temática.
- **FR-002**: El sistema MUST aceptar el envío solo desde las 00:00 del día de apertura hasta las 23:59:59 del día de cierre, en la zona horaria del congreso (000-core FR-005a); fuera de ese periodo MUST rechazarlo con un mensaje que explique el motivo.
- **FR-003**: El sistema MUST comprobar que el área temática pertenece al congreso elegido.
- **FR-004**: El sistema MUST registrar como autor al usuario que envía, la fecha de envío y el estado `ENVIADA`.
- **FR-005**: El sistema MUST mostrar al ponente solo sus propias propuestas, con su estado actual.
- **FR-006**: Las reglas FR-001 … FR-004 MUST validarse en el servidor (Constitución IV).
- **FR-007**: La lista de congresos para enviar MUST mostrar solo los que tienen la llamada abierta e indicar el día de cierre del plazo.
- **FR-008**: Una propuesta enviada MUST ser inmutable para su autor: no se ofrece ni existe operación para editarla o retirarla (Clarifications P1).
- **FR-009**: El sistema MUST NOT limitar el número de propuestas de un ponente por congreso (Clarifications P2).
- **FR-010**: Lo que ve el ponente de sus propuestas (pantalla y respuesta del servidor) MUST limitarse a congreso, título, área, resumen, fecha de envío y estado; nunca puntuaciones, comentarios ni evaluadores (Clarifications P3).

### Key Entities

- **Propuesta**, **ÁreaTemática**, **Congreso** (plazo de envío), **Usuario** (autor). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un ponente envía una propuesta válida en menos de 3 minutos desde que abre el formulario.
- **SC-002**: El 100 % de los envíos fuera de plazo se rechazan, también los hechos con una petición directa al servidor.
- **SC-003**: El ponente ve el estado actualizado de su propuesta en cuanto el comité u organizador lo cambia (al recargar la página).

## Assumptions

- **Decisión (Clarifications P1)**: editar o retirar una propuesta enviada queda fuera de la versión 1; la narrativa no lo pide (Constitución II) y cambiar una propuesta en evaluación alteraría lo que evalúa el comité.
- Una propuesta tiene un único autor, que es también el ponente que la presentará.
- No se adjuntan ficheros; el resumen es texto.
- Los límites de longitud del título y del resumen son supuestos del grupo.
