# Feature Specification: Inscribirse y pagar la entrada (HU-04)

**Feature Branch**: `spec-004`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-04 · Como asistente, quiero inscribirme eligiendo mi tipo de entrada y pagarla para asistir al congreso."

## Clarifications

### Session 2026-11-03

- Q: ¿Puede el asistente cambiar el tipo de asistente o cancelar una inscripción pendiente de pago? → A: No en la versión 1; tipo e importe quedan fijados al crear la inscripción. *(La parte de «cancelar» se revisa en la sesión 2026-11-04, P4.)*
- Q: ¿Se admiten inscripciones durante el congreso? → A: Sí, hasta que el congreso finaliza.
- Q: ¿Qué datos pide la pasarela simulada y cuándo rechaza el pago? → A: Un número de tarjeta de 16 dígitos (se admiten espacios); solo la tarjeta de prueba 4000 0000 0000 0002 se rechaza; no se guarda el número, solo los 4 últimos dígitos en la referencia del pago.

### Session 2026-11-04 (clarify sobre la versión funcional)

- Q: Si el asistente se equivocó de tipo (p. ej. eligió «Estudiante») y aún no ha pagado, ¿cómo lo corrige? → A: Puede cancelar la inscripción `PENDIENTE_PAGO` e inscribirse de nuevo con otro tipo, al precio vigente ese día. Una inscripción `CONFIRMADA` no se puede cancelar. El tipo de una inscripción sigue sin poder cambiarse.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inscribirme con la tarifa correcta (Priority: P1)

El asistente elige el congreso y su tipo de asistente (profesional, socio, estudiante). El sistema le muestra el
precio que le corresponde según la fecha (temprano o general) y crea la inscripción pendiente de pago con ese importe fijado.

**Why this priority**: sin inscripción no hay asistentes, agenda, acreditación ni ingresos.

**Independent Test**: inscribirse como estudiante antes de la fecha límite temprana y comprobar el importe temprano; repetir con un congreso cuya fecha temprana ya ha pasado y comprobar el importe general.

**Acceptance Scenarios**:

1. **Given** un congreso con tarifas y el momento actual anterior o igual a las 23:59:59 del día límite temprano (hora del congreso), **When** un asistente elige «Estudiante», **Then** ve el precio temprano de estudiante y, al confirmar, se crea la inscripción `PENDIENTE_PAGO` con ese importe.
2. **Given** el día siguiente al día límite temprano (desde las 00:00, hora del congreso), **When** elige un tipo, **Then** se aplica el precio general.
3. **Given** un asistente que ya tiene una inscripción (pendiente o confirmada) en ese congreso, **When** intenta inscribirse otra vez, **Then** el sistema lo rechaza y le lleva a su inscripción existente.
4. **Given** un congreso finalizado, **When** alguien intenta inscribirse, **Then** el sistema lo rechaza; **Given** un congreso en curso, **When** un asistente se inscribe, **Then** se acepta con la tarifa vigente (Clarifications P2).
5. **Given** un visitante sin sesión, **When** pulsa «Inscribirme», **Then** se le pide iniciar sesión o registrarse como asistente y vuelve después a la inscripción.
6. **Given** un usuario con sesión que solo tiene el rol ponente, **When** pulsa «Inscribirme», **Then** se le ofrece añadirse el rol asistente (000-core FR-003a) y, tras aceptarlo, continúa con la inscripción; sin aceptarlo, el servidor rechaza la inscripción.
7. **Given** una petición manipulada con un importe distinto, **When** llega al servidor, **Then** se ignora: el importe lo calcula siempre el servidor.

---

### User Story 2 - Pagar y obtener la acreditación (Priority: P1)

El asistente paga su inscripción en la pasarela simulada. Si el pago se aprueba, la inscripción pasa a `CONFIRMADA`
y obtiene su acreditación con código QR en el área personal.

**Why this priority**: la narrativa dice que «la inscripción solo se confirma cuando se ha pagado».

**Independent Test**: pagar con una tarjeta de prueba válida (confirmada y con QR) y con la tarjeta de rechazo (sigue pendiente).

**Acceptance Scenarios**:

1. **Given** una inscripción `PENDIENTE_PAGO`, **When** el pago simulado se aprueba, **Then** la inscripción pasa a `CONFIRMADA`, se registra el pago con su importe y el asistente ve su QR de acreditación.
2. **Given** una inscripción `PENDIENTE_PAGO`, **When** el pago se rechaza, **Then** la inscripción sigue pendiente, no tiene QR, se informa del rechazo y puede reintentarlo.
3. **Given** una inscripción ya `CONFIRMADA`, **When** se intenta pagar de nuevo, **Then** el sistema lo rechaza (no hay pagos dobles).
4. **Given** una inscripción de otro usuario, **When** alguien intenta pagarla o ver su QR, **Then** el sistema lo rechaza.
5. **Given** una inscripción pendiente, **When** el asistente abre su área personal, **Then** ve «Pendiente de pago», el importe y los botones «Pagar» y «Cancelar inscripción», pero no el QR.
6. **Given** una inscripción `PENDIENTE_PAGO` como estudiante con un pago rechazado, **When** su titular la cancela y se inscribe de nuevo como profesional, **Then** primero ve su inscripción «Cancelada» y, al inscribirse de nuevo, «Pendiente de pago» como profesional con el precio de profesional vigente ese día; el intento de pago rechazado se conserva (Clarifications P4).
7. **Given** una inscripción `CONFIRMADA` o de otro usuario, **When** alguien intenta cancelarla (también con una petición directa), **Then** el sistema lo rechaza y la inscripción no cambia.

### Edge Cases

- El asistente crea la inscripción en plazo temprano y paga después de la fecha límite: paga el importe fijado al crearla (A4).
- Doble clic en «Pagar»: solo se registra un pago aprobado (bloqueo en el servidor).
- El tipo «socio» no se comprueba contra un registro de socios (supuesto).
- Un número de tarjeta que no tiene 16 dígitos se rechaza como dato no válido, sin crear ningún pago (Clarifications P3).
- Una inscripción pendiente no se puede cambiar de tipo (Clarifications P1), pero su titular sí puede cancelarla e inscribirse de nuevo (Clarifications P4). Si la nueva inscripción se crea después del día límite temprano, paga el precio general: el importe se fija al crear cada inscripción (A4).
- El QR se puede ver de nuevo en cualquier momento desde el área personal y se adapta a la pantalla del móvil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar, para cada tipo de asistente, el precio vigente (temprano o general) antes de inscribirse.
- **FR-002**: El sistema MUST calcular en el servidor el importe según tipo de asistente y si la inscripción se crea como muy tarde a las 23:59:59 del día límite temprano en la zona del congreso (000-core FR-005a/FR-016), y fijarlo en la inscripción (A4).
- **FR-003**: Un usuario MUST tener como máximo una inscripción no cancelada por congreso.
- **FR-004**: Solo usuarios con rol `ASISTENTE` MUST poder inscribirse; no se admiten inscripciones en congresos finalizados.
- **FR-005**: La inscripción MUST nacer `PENDIENTE_PAGO` y pasar a `CONFIRMADA` solo con un pago aprobado.
- **FR-006**: Al confirmarse, el sistema MUST generar un código de acreditación único y no adivinable y mostrarlo como QR en el área personal.
- **FR-007**: Un pago rechazado MUST dejar la inscripción pendiente y permitir reintentar.
- **FR-008**: El sistema MUST registrar cada intento de pago (importe, resultado, fecha) sin guardar datos de tarjeta.
- **FR-009**: Solo el propietario MUST poder pagar su inscripción y ver su QR.
- **FR-010**: Importes en euros con formato español.
- **FR-011**: El tipo de asistente y el importe MUST ser inmutables mientras la inscripción no se cancele; no hay operación para cambiarlos (Clarifications P1). Para corregir el tipo, el titular cancela y vuelve a inscribirse (FR-014): entonces se fijan de nuevo con la tarifa vigente ese día.
- **FR-012**: Se MUST admitir inscripciones hasta el fin del congreso, también mientras está en curso (Clarifications P2).
- **FR-013**: La pasarela simulada MUST pedir un número de 16 dígitos; MUST rechazar solo la tarjeta 4000 0000 0000 0002; el pago MUST guardar como referencia «SIM-…-últimos 4 dígitos» y nunca el número completo (Clarifications P3).
- **FR-014**: El titular MUST poder cancelar una inscripción `PENDIENTE_PAGO`; pasa a `CANCELADA`, conserva sus intentos de pago y deja de contar para FR-003. Una inscripción `CONFIRMADA` MUST NOT poder cancelarse (Clarifications P4).

### Key Entities

- **Tarifa**, **Inscripción**, **Pago**. Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un asistente completa inscripción y pago en menos de 3 minutos.
- **SC-002**: El 100 % de las inscripciones confirmadas tienen exactamente un pago aprobado y un código de acreditación único.
- **SC-003**: El importe de toda inscripción coincide con la tarifa vigente en su fecha de creación.

## Assumptions

- Pasarela simulada (A5); no se integran pagos reales. La tarjeta `4000 0000 0000 0002` provoca el rechazo.
- No se cancelan inscripciones confirmadas ni hay reembolsos ni facturas en la versión 1; solo se puede cancelar una inscripción pendiente de pago (FR-014).
- Las tarifas de cada congreso vienen de los datos de ejemplo (p. ej. profesional 250 € / 300 €, socio 180 € / 220 €, estudiante 90 € / 120 €).
- La condición de socio o estudiante es declarativa; no se pide justificante.
