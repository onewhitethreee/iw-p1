# Feature Specification: Construir mi agenda personal (HU-05)

**Feature Branch**: `spec-005`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-05 · Como asistente inscrito, quiero añadir a mi agenda las sesiones a las que quiero ir para organizar mi congreso."

## Clarifications

### Session 2026-11-03

- Q: Si el organizador mueve una sesión y ahora se solapa con otra que el asistente ya tenía en su agenda, ¿qué pasa con la agenda? → A: La agenda conserva ambas sesiones y el asistente ve, en las dos, el aviso «Se solapa con «…»» para que decida cuál quitar; la regla de solape se aplica al añadir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Añadir sesiones a mi agenda respetando solapes y aforo (Priority: P1)

Un asistente con inscripción confirmada recorre el programa publicado y añade sesiones a su agenda. Cada sesión
añadida le reserva una plaza. El sistema no le deja añadir una sesión que se solape con otra de su agenda ni una sesión con el aforo completo.

**Why this priority**: es exactamente lo que pide la narrativa y alimenta el certificado (HU-07).

**Independent Test**: con `asistente1` (confirmado), añadir una sesión; intentar añadir otra solapada (rechazado); intentar añadir una sesión de «Aula 3» ya completa (rechazado).

**Acceptance Scenarios**:

1. **Given** un asistente con inscripción `CONFIRMADA` y una sesión con plazas libres que no se solapa con su agenda, **When** la añade, **Then** aparece en su agenda y las plazas libres de la sesión bajan en 1.
2. **Given** una sesión de 10:00 a 11:00 en la agenda, **When** el asistente intenta añadir otra de 10:30 a 11:30, **Then** el sistema lo rechaza indicando con qué sesión se solapa.
3. **Given** una sesión de 10:00 a 11:00 en la agenda, **When** añade otra de 11:00 a 12:00, **Then** se acepta (contiguas no se solapan, A7).
4. **Given** una sesión cuyas reservas ya igualan el aforo de su sala, **When** el asistente intenta añadirla, **Then** el sistema lo rechaza con «Aforo completo» y la sesión se muestra como completa.
5. **Given** dos asistentes que intentan reservar a la vez la última plaza, **When** llegan ambas peticiones, **Then** solo una se acepta y la otra recibe «Aforo completo».
6. **Given** un asistente con inscripción `PENDIENTE_PAGO` o sin inscripción, **When** intenta añadir una sesión (también con una petición directa), **Then** el sistema lo rechaza indicando que necesita una inscripción confirmada.
7. **Given** una sesión que ya está en su agenda, **When** intenta añadirla de nuevo, **Then** el sistema lo rechaza sin duplicarla.

---

### User Story 2 - Consultar y quitar sesiones de mi agenda (Priority: P2)

El asistente ve su agenda ordenada por día y hora y puede quitar sesiones que todavía no han empezado, liberando su plaza.

**Why this priority**: completa la gestión de la agenda; la narrativa no lo prohíbe y es necesario para corregir errores.

**Independent Test**: quitar una sesión futura de la agenda y comprobar que la plaza vuelve a estar libre.

**Acceptance Scenarios**:

1. **Given** una agenda con varias sesiones, **When** el asistente la abre, **Then** las ve ordenadas por día y hora, con sala y horario en la zona horaria del congreso.
2. **Given** una sesión futura en la agenda, **When** el asistente la quita, **Then** desaparece de su agenda y la sesión recupera una plaza libre.
3. **Given** una sesión que ya ha empezado o terminado, **When** intenta quitarla, **Then** el sistema lo rechaza (afectaría al cálculo del certificado, HU-07).
4. **Given** dos sesiones de la agenda que han pasado a solaparse porque el organizador movió una, **When** el asistente abre su agenda, **Then** ambas muestran el aviso «Se solapa con «…»» y puede quitar una de ellas (Clarifications P1).

### Edge Cases

- Programa en borrador: el asistente no puede construir agenda hasta que se publique.
- Si el organizador mueve una sesión de la agenda a otro horario y ahora se solapa con otra de la agenda, la agenda conserva ambas; el asistente ve un aviso de solape para que decida cuál quitar (la regla de A7 se comprueba al añadir).
- Sesiones de otro congreso nunca aparecen en la agenda de este.
- No se pueden añadir sesiones que ya han empezado o terminado (FR-002).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo un usuario con inscripción `CONFIRMADA` en el congreso MUST poder añadir o quitar sesiones de su agenda.
- **FR-002**: Solo se MUST poder añadir sesiones del programa publicado de ese congreso que aún no han empezado.
- **FR-003**: El sistema MUST rechazar añadir una sesión que se solape (A7) con otra de la agenda, indicando con cuál.
- **FR-004**: El sistema MUST rechazar añadir una sesión cuyas reservas hayan alcanzado el aforo de su sala (A6), también ante peticiones simultáneas.
- **FR-005**: El sistema MUST impedir duplicar una sesión en la agenda.
- **FR-006**: El asistente MUST poder quitar sesiones que no han empezado; al quitarlas se libera la plaza.
- **FR-007**: La lista de sesiones MUST mostrar las plazas libres y marcar las completas y las que ya están en la agenda.
- **FR-008**: Todas las reglas MUST validarse en el servidor.
- **FR-009**: La agenda MUST marcar con un aviso las sesiones que se solapan entre sí por cambios posteriores del programa, sin quitarlas (Clarifications P1).

### Key Entities

- **EntradaAgenda**, **Sesión**, **Sala** (aforo), **Inscripción** (confirmada). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 agendas con dos sesiones solapadas creadas a través del sistema.
- **SC-002**: 0 sesiones con más reservas que aforo, incluso con 20 peticiones simultáneas por la última plaza.
- **SC-003**: Un asistente añade una sesión a su agenda con un solo clic desde el programa.

## Assumptions

- Reservar en la agenda equivale a reservar plaza (A6).
- No existe lista de espera para sesiones completas (no la pide la narrativa).
- El personal de acreditación no exige que la sesión esté en la agenda para entrar (ver spec-006).
