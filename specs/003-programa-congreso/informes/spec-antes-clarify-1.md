# Feature Specification: Montar y publicar el programa (HU-03)

**Feature Branch**: `spec-003`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-03 · Como organizador, quiero asignar cada ponencia aceptada a una sala y un horario y publicar el programa para que los asistentes y el público lo consulten."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Programar ponencias aceptadas sin solapamientos (Priority: P1)

El organizador ve las ponencias aceptadas pendientes de programar y asigna a cada una una sala, una hora de inicio
y una de fin. El sistema impide que un ponente tenga dos sesiones a la vez y que una sala tenga dos sesiones a la vez.

**Why this priority**: es la regla crítica que destaca la narrativa («el sistema no debe permitir que eso ocurra»).

**Independent Test**: programar una ponencia; intentar programar otra del mismo ponente a la misma hora en otra sala (rechazado); intentar otra ponencia en la misma sala y hora (rechazado).

**Acceptance Scenarios**:

1. **Given** una ponencia aceptada sin programar y una sala libre de 10:00 a 10:30, **When** el organizador la programa en esa sala y horario, **Then** se crea la sesión y la ponencia desaparece de «pendientes».
2. **Given** un ponente con una sesión de 10:00 a 10:30, **When** el organizador programa otra ponencia suya de 10:15 a 10:45 en otra sala, **Then** el sistema lo rechaza indicando el ponente y la sesión con la que se solapa.
3. **Given** una sala ocupada de 10:00 a 10:30, **When** se programa otra sesión en esa sala de 10:00 a 10:30, **Then** el sistema lo rechaza indicando la sesión que ocupa la sala.
4. **Given** una sesión de 10:00 a 10:30, **When** se programa otra del mismo ponente o en la misma sala de 10:30 a 11:00, **Then** se acepta (los intervalos contiguos no se solapan, A7).
5. **Given** una propuesta en estado `ENVIADA`, `EN_EVALUACION` o `RECHAZADA`, **When** se intenta programar (también con una petición directa), **Then** el sistema lo rechaza: solo se programan ponencias aceptadas.
6. **Given** un horario con el fin antes del inicio o fuera de las fechas del congreso, **When** se programa, **Then** el sistema lo rechaza indicando el error.
7. **Given** un usuario que no es organizador, **When** intenta programar, mover o quitar una sesión, **Then** el sistema lo rechaza.

---

### User Story 2 - Modificar el programa (Priority: P2)

El organizador puede cambiar la sala o el horario de una sesión, o quitarla, con las mismas reglas.

**Why this priority**: el programa se ajusta muchas veces antes y durante el congreso (HU-08 lo usa para cambiar de sala).

**Independent Test**: mover una sesión a otra hora libre (aceptado) y a una hora que solapa con el mismo ponente (rechazado).

**Acceptance Scenarios**:

1. **Given** una sesión programada, **When** el organizador la mueve a otra sala u horario sin conflictos, **Then** se guarda el cambio y se refleja en el programa público si está publicado.
2. **Given** un movimiento que provoca solapamiento de ponente o de sala, **When** se guarda, **Then** el sistema lo rechaza y la sesión conserva su sala y horario anteriores.
3. **Given** una sesión con reservas en agendas, **When** se mueve a una sala con aforo menor que el número de reservas, **Then** el sistema lo rechaza indicando el número de reservas.
4. **Given** una sesión que está en alguna agenda o tiene asistencias, **When** el organizador intenta quitarla, **Then** el sistema lo rechaza; sin reservas ni asistencias, se quita y la ponencia vuelve a «pendientes».

---

### User Story 3 - Publicar el programa en la web, bien posicionado (Priority: P1)

El organizador publica el programa. Cualquier visitante, sin iniciar sesión, lo consulta en una página pública del
congreso, renderizada en el servidor y con metadatos para buscadores.

**Why this priority**: la narrativa pide expresamente la publicación y el posicionamiento en buscadores.

**Independent Test**: publicar el programa; abrir `/congresos/<slug>/programa` sin sesión y ver las sesiones; comprobar en el HTML recibido (sin JavaScript) el título, la descripción, el contenido de las sesiones y los datos estructurados.

**Acceptance Scenarios**:

1. **Given** un programa en borrador, **When** el organizador lo publica, **Then** el programa pasa a publicado y la página pública muestra las sesiones agrupadas por día y ordenadas por hora, con sala, título, área y ponente.
2. **Given** un programa en borrador, **When** un visitante abre la página pública, **Then** ve un aviso «El programa aún no se ha publicado» y ninguna sesión.
3. **Given** el programa publicado, **When** un buscador pide la página, **Then** recibe el HTML completo con título, descripción, URL canónica, Open Graph y datos estructurados de evento, y la página aparece en el `sitemap.xml`.
4. **Given** el programa publicado, **When** el organizador mueve una sesión, **Then** la página pública muestra el cambio en la siguiente visita.
5. **Given** un visitante, **When** abre el detalle de una sesión, **Then** ve el resumen de la ponencia, el ponente, la sala y el horario en una URL propia indexable.

### Edge Cases

- Un ponente con varias ponencias aceptadas: la regla de solapamiento se aplica entre todas ellas.
- Sesión que cruza la medianoche: se permite si está dentro de las fechas del congreso.
- Dos organizadores programando a la vez la misma sala: el segundo recibe el rechazo por solapamiento (bloqueo en el servidor, R4).
- Publicar un programa vacío está permitido (muestra «Sin sesiones todavía»).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo el `ORGANIZADOR` MUST poder programar, mover, quitar sesiones y publicar el programa.
- **FR-002**: Solo una propuesta `ACEPTADA` MUST poder programarse, y como máximo en una sesión.
- **FR-003**: Una sesión MUST tener sala del mismo congreso e intervalo `inicio < fin` dentro de las fechas del congreso.
- **FR-004**: El sistema MUST rechazar cualquier alta o cambio que haga coincidir dos sesiones del mismo ponente (A7).
- **FR-005**: El sistema MUST rechazar cualquier alta o cambio que haga coincidir dos sesiones en la misma sala (A7).
- **FR-006**: Al mover una sesión, el aforo de la nueva sala MUST ser ≥ número de reservas de esa sesión en agendas.
- **FR-007**: No MUST poder quitarse una sesión con reservas o asistencias.
- **FR-008**: Los mensajes de rechazo MUST identificar la sesión con la que se produce el conflicto.
- **FR-009**: El programa publicado MUST ser accesible sin sesión, renderizado en el servidor, con título, descripción, URL canónica, Open Graph, datos estructurados de evento por congreso y por sesión, e incluido en `sitemap.xml`; `robots.txt` MUST permitir su indexación.
- **FR-010**: Mientras el programa esté en borrador, la página pública MUST no mostrar sesiones.
- **FR-011**: Todas las reglas MUST validarse en el servidor.

### Key Entities

- **Sesión**, **Sala**, **Propuesta** (aceptada), **Congreso** (estado del programa). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 casos de ponente con dos sesiones solapadas o de sala doblemente ocupada en la base de datos, incluso con peticiones simultáneas.
- **SC-002**: La página pública del programa obtiene ≥ 90 en la categoría SEO de Lighthouse.
- **SC-003**: El HTML inicial de la página pública (sin ejecutar JavaScript) contiene todas las sesiones publicadas.
- **SC-004**: Un organizador programa una ponencia en menos de 1 minuto.

## Assumptions

- Una sesión corresponde a una única ponencia (la narrativa asigna «cada ponencia a una sala y a un horario»).
- Las salas vienen de los datos de ejemplo (no hay pantalla de gestión de salas, 000-core).
- No se «despublica» el programa: una vez publicado, los cambios se reflejan directamente.
- No se notifica a los asistentes de los cambios de horario (no hay correos en la versión 1).
