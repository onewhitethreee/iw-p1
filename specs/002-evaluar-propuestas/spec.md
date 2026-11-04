# Feature Specification: Evaluar propuestas de forma anónima (HU-02)

**Feature Branch**: `spec-002`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-02 · Como miembro del comité científico, quiero evaluar las propuestas que tengo asignadas con una puntuación y comentarios para seleccionar las mejores ponencias."

## Clarifications

### Session 2026-11-03

- Q: Si un evaluador asignado no evalúa, ¿puede el organizador quitarle la asignación? → A: No; las asignaciones no se quitan. El organizador puede asignar más evaluadores y decidir en cuanto haya al menos 2 evaluaciones.
- Q: ¿La decisión del organizador está sujeta a una nota mínima? → A: No; decide libremente viendo la puntuación media y el número de evaluaciones.

### Session 2026-11-04 (clarify sobre la versión funcional)

- Q: La narrativa dice que el comité está «formado por expertos del área». ¿Debe el sistema impedir asignar una propuesta a un miembro de otra área? → A: No; cualquier miembro del comité puede recibir cualquier propuesta del congreso. Elegir al evaluador adecuado lo decide el organizador.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evaluar una propuesta asignada sin conocer al autor (Priority: P1)

Un miembro del comité ve la lista de propuestas que tiene asignadas, abre una (título, resumen y área, sin datos
del autor) y la evalúa con una puntuación de 1 a 10 y comentarios.

**Why this priority**: es el núcleo de la historia y lo que exige la narrativa (revisión anónima).

**Independent Test**: como `comite1`, abrir una propuesta asignada, evaluarla y comprobar que en ningún momento aparece el autor (ni en pantalla ni en la respuesta del servidor).

**Acceptance Scenarios**:

1. **Given** un evaluador con propuestas asignadas, **When** abre «Mis evaluaciones», **Then** ve solo sus propuestas asignadas, con título, área y si ya las ha evaluado, sin nombre, correo ni identificador del autor.
2. **Given** una propuesta asignada pendiente, **When** el evaluador envía una puntuación entre 1 y 10 y comentarios, **Then** la evaluación se guarda y la propuesta aparece como evaluada en su lista.
3. **Given** una puntuación fuera de 1–10 o sin comentarios, **When** el evaluador la envía, **Then** el sistema la rechaza indicando el error.
4. **Given** una propuesta que no tiene asignada, **When** el evaluador intenta verla o evaluarla con una petición directa, **Then** el sistema la rechaza por falta de permiso.
5. **Given** una evaluación ya hecha y la propuesta aún sin decidir, **When** el evaluador la modifica, **Then** se guarda la nueva puntuación y comentarios (una sola evaluación por evaluador).
6. **Given** una propuesta ya aceptada o rechazada, **When** el evaluador intenta evaluarla o modificar su evaluación, **Then** el sistema lo rechaza indicando que la propuesta ya está decidida.

---

### User Story 2 - Asignar evaluadores a las propuestas (Priority: P1)

El organizador asigna cada propuesta a miembros del comité. La primera asignación pasa la propuesta a `EN_EVALUACION`.

**Why this priority**: sin asignaciones el comité no tiene nada que evaluar; la narrativa dice que cada miembro «tiene asignadas» propuestas.

**Independent Test**: como organizador, asignar una propuesta `ENVIADA` a dos evaluadores y comprobar que cambia a `EN_EVALUACION` y que aparece en la lista de ambos.

**Acceptance Scenarios**:

1. **Given** una propuesta `ENVIADA`, **When** el organizador la asigna a un miembro del comité, **Then** la propuesta pasa a `EN_EVALUACION` y aparece en la lista de ese evaluador.
2. **Given** un miembro del comité que es autor de la propuesta, **When** el organizador intenta asignársela, **Then** el sistema lo rechaza («Un evaluador no puede evaluar su propia propuesta»).
3. **Given** un evaluador ya asignado a la propuesta, **When** se le asigna otra vez, **Then** el sistema lo rechaza.
4. **Given** un usuario sin rol comité, **When** el organizador intenta asignárselo, **Then** el sistema lo rechaza.
5. **Given** un usuario que no es organizador, **When** intenta asignar, **Then** el sistema lo rechaza.

---

### User Story 3 - Aceptar o rechazar con al menos dos evaluaciones (Priority: P2)

El organizador ve, por propuesta, el número de evaluaciones y la puntuación media, y decide aceptarla o rechazarla.

**Why this priority**: cierra la selección y produce las ponencias aceptadas que necesita HU-03.

**Independent Test**: intentar aceptar una propuesta con una sola evaluación (rechazado) y otra con dos (aceptada).

**Acceptance Scenarios**:

1. **Given** una propuesta con 2 o más evaluaciones, **When** el organizador la acepta, **Then** pasa a `ACEPTADA` y queda disponible para programarse (HU-03).
2. **Given** una propuesta con menos de 2 evaluaciones, **When** el organizador intenta aceptarla o rechazarla (también con una petición directa), **Then** el sistema lo rechaza indicando «Se necesitan al menos 2 evaluaciones (tiene N)».
3. **Given** una propuesta ya decidida, **When** el organizador intenta decidir otra vez, **Then** el sistema lo rechaza.
4. **Given** la lista del organizador, **When** la abre, **Then** ve por propuesta: título, área, autor, número de evaluaciones, media y estado, y puede ordenar por media.
5. **Given** una propuesta con 2 evaluaciones y media 4,5, **When** el organizador la acepta, **Then** se acepta: no hay nota mínima (Clarifications P2).

### Edge Cases

- El organizador sí ve el autor; el anonimato aplica solo al comité.
- Un usuario con roles ponente y comité solo ve, como evaluador, las propuestas asignadas (nunca las suyas).
- Un evaluador no ve las puntuaciones ni los comentarios de otros evaluadores; solo la suya.
- Si se asignan más de dos evaluadores, la decisión puede tomarse cuando haya al menos dos evaluaciones, aunque falten otras.
- Si un evaluador guarda su evaluación justo cuando el organizador decide, prevalece el orden real: si la decisión llega antes, la evaluación se rechaza («La propuesta ya está decidida»); nunca se modifica una evaluación después de la decisión (analyze U1).
- Un evaluador asignado que no evalúa no bloquea la propuesta: el organizador asigna otro; las asignaciones no se quitan (Clarifications P1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo el `ORGANIZADOR` MUST poder asignar propuestas a usuarios con rol `COMITE` (A2).
- **FR-002**: El sistema MUST impedir asignar una propuesta a su propio autor y asignar dos veces al mismo evaluador.
- **FR-003**: La primera asignación MUST pasar la propuesta de `ENVIADA` a `EN_EVALUACION`.
- **FR-004**: Un evaluador MUST ver y evaluar solo las propuestas que tiene asignadas.
- **FR-005**: Ninguna pantalla ni respuesta del servidor dirigida al comité MUST contener nombre, correo o identificador del autor (FR-013 de 000-core).
- **FR-006**: Una evaluación MUST tener puntuación entera de 1 a 10 y comentarios (10–2000 caracteres); una por evaluador y propuesta, modificable hasta que la propuesta se decida.
- **FR-007**: El organizador MUST poder aceptar o rechazar una propuesta solo si tiene al menos 2 evaluaciones; la decisión es definitiva.
- **FR-008**: El organizador MUST ver por propuesta el número de evaluaciones y la puntuación media.
- **FR-009**: Todas las reglas anteriores MUST validarse en el servidor.
- **FR-010**: Las asignaciones MUST ser permanentes: no existe operación para quitarlas (Clarifications P1).
- **FR-011**: La decisión MUST depender solo de la voluntad del organizador y del mínimo de 2 evaluaciones; no hay nota mínima ni decisión automática (Clarifications P2).
- **FR-012**: La asignación MUST NOT restringirse por área temática: el organizador puede asignar a cualquier usuario con rol `COMITE` una propuesta de cualquier área del congreso, con las únicas restricciones de FR-002 (Clarifications P3).

### Key Entities

- **Asignación**, **Evaluación**, **Propuesta** (estado). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 respuestas del servidor a usuarios del comité contienen datos del autor (comprobado con pruebas de integración sobre todas las consultas del comité).
- **SC-002**: El 100 % de los intentos de decidir con menos de 2 evaluaciones se rechazan.
- **SC-003**: Un evaluador completa una evaluación en menos de 2 minutos tras leer el resumen.

## Assumptions

- La asignación es manual por parte del organizador; no hay reparto automático (no lo pide la narrativa).
- No se gestionan conflictos de interés más allá de la autoría (p. ej. misma institución).
- **Decisión (Clarifications P3)**: el comité no está separado por área; cualquier miembro puede recibir cualquier propuesta. No se registran especialidades de los evaluadores.
- El ponente no ve los comentarios del comité en la versión 1.
