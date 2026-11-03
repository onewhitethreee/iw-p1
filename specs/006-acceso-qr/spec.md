# Feature Specification: Controlar el acceso a la sala con QR (HU-06)

**Feature Branch**: `spec-006`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-06 · Como personal de acreditación, quiero escanear el QR del asistente a la entrada de la sala para controlar el aforo y registrar la asistencia real."

## Clarifications

### Session 2026-11-03

- Q: ¿Para entrar en una sala, la sesión tiene que estar en la agenda del asistente? → A: No; se admite a cualquier asistente con inscripción confirmada en el congreso mientras quede aforo. La asistencia a sesiones fuera de la agenda no cuenta para el certificado (HU-07).
- Q: ¿Desde cuándo y hasta cuándo se puede escanear la entrada de una sesión? → A: Desde 30 minutos antes del inicio hasta el fin de la sesión.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escanear y admitir o rechazar la entrada (Priority: P1)

El personal de acreditación elige el congreso y la sesión de la sala donde está y escanea con el móvil el QR del
asistente. El sistema responde en pantalla, de forma muy visible, «Admitido» (verde) o «Rechazado» (rojo) con el
motivo, y registra la asistencia cuando se admite.

**Why this priority**: controla el aforo y genera la asistencia real de la que dependen HU-07 y HU-08.

**Independent Test**: como `acreditacion`, elegir una sesión y escanear (o escribir) el código de `asistente1`: admitido; repetir: ya registrado; código inventado: rechazado; sesión de «Aula 3» con aforo lleno: rechazado.

**Acceptance Scenarios**:

1. **Given** una sesión con aforo disponible y un QR de una inscripción `CONFIRMADA` del mismo congreso, **When** el personal lo escanea, **Then** el sistema muestra «Admitido» con el nombre del asistente, registra la asistencia a esa sesión y actualiza la ocupación (p. ej. «37 / 40»).
2. **Given** una sesión cuyas asistencias ya igualan el aforo de la sala, **When** se escanea un QR válido de alguien que aún no ha entrado, **Then** el sistema muestra «Rechazado: aforo completo» y no registra la asistencia.
3. **Given** un código que no corresponde a ninguna acreditación, **When** se escanea, **Then** muestra «Rechazado: acreditación no válida».
4. **Given** el código de una inscripción `PENDIENTE_PAGO` o de otro congreso, **When** se escanea, **Then** muestra «Rechazado» con el motivo («inscripción no confirmada» / «acreditación de otro congreso»).
5. **Given** un asistente que ya tiene registrada la asistencia a esa sesión, **When** se escanea de nuevo (salió y vuelve a entrar), **Then** muestra «Ya registrado» en ámbar, le deja pasar y no cuenta una segunda asistencia ni consume aforo.
6. **Given** un usuario sin rol `ACREDITACION`, **When** intenta abrir el escáner o registrar una asistencia con una petición directa, **Then** el sistema lo rechaza.
7. **Given** una cámara que no puede leer el QR, **When** el personal escribe el código a mano, **Then** el resultado es el mismo que con el escaneo.

---

### User Story 2 - Ver la ocupación de la sesión en la puerta (Priority: P2)

En la pantalla del escáner se ve siempre la ocupación actual de la sesión elegida y cuántas plazas quedan.

**Why this priority**: ayuda al personal a avisar en la puerta antes de que llegue el rechazo.

**Independent Test**: admitir a dos personas y comprobar que el contador sube en 2.

**Acceptance Scenarios**:

1. **Given** la pantalla del escáner abierta en una sesión, **When** se admite a alguien (en esa puerta o en otra puerta de la misma sesión), **Then** el contador de ocupación se actualiza en pocos segundos.

### Edge Cases

- Dos puertas de la misma sala escanean a la vez con una sola plaza libre: solo una entrada se admite (bloqueo en el servidor, R4).
- Escanear para una sesión que ya ha terminado: se rechaza («La sesión ya ha terminado»). Se permite escanear desde 30 minutos antes del inicio.
- Un asistente que entra en una sesión que no está en su agenda: se admite si hay aforo (la narrativa controla el aforo de la sala, no la agenda); la asistencia cuenta para el panel pero no suma al certificado (HU-07 solo cuenta las sesiones de la agenda).
- Sin conexión a la red: fuera de alcance; el escáner indica que no puede validar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo usuarios con rol `ACREDITACION` MUST poder registrar asistencias.
- **FR-002**: El personal MUST elegir congreso y sesión antes de escanear; el escáner MUST aceptar también la entrada manual del código.
- **FR-003**: El sistema MUST admitir la entrada solo si el código existe, la inscripción está `CONFIRMADA`, es del mismo congreso, la sesión está en su ventana de acceso (desde 30 min antes del inicio hasta el fin) y quedan plazas (asistencias < aforo de la sala).
- **FR-004**: Cada entrada admitida MUST registrar una asistencia (inscripción, sesión, momento, personal que escanea).
- **FR-005**: Un segundo escaneo del mismo asistente en la misma sesión MUST responder «Ya registrado» sin crear otra asistencia ni consumir aforo.
- **FR-006**: Cada rechazo MUST mostrar un motivo comprensible.
- **FR-007**: La pantalla MUST mostrar la ocupación actual de la sesión frente a su aforo.
- **FR-008**: El control de aforo MUST ser correcto con escaneos simultáneos.
- **FR-009**: La entrada MUST no depender de que la sesión esté en la agenda del asistente (Clarifications P1).
- **FR-010**: Fuera de la ventana de acceso el escaneo MUST rechazarse con «La sesión aún no está abierta (se abre a las HH:mm)» o «La sesión ya ha terminado» (Clarifications P2).

### Key Entities

- **Asistencia**, **Inscripción** (código de acreditación), **Sesión**, **Sala** (aforo). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La respuesta a un escaneo aparece en menos de 1 segundo en condiciones normales de red.
- **SC-002**: 0 sesiones con más asistencias que aforo, incluso con escaneos simultáneos.
- **SC-003**: El 100 % de las acreditaciones no válidas, no confirmadas o de otro congreso se rechazan.

## Assumptions

- El personal usa un móvil con cámara y navegador; no hay lectores dedicados.
- No se registra la salida de la sala; la ocupación es el número de personas que han entrado (asistencias).
- **Decisión (Clarifications P2)**: ventana de acceso desde 30 minutos antes del inicio hasta el fin.
- **Decisión (Clarifications P1)**: no se exige que la sesión esté en la agenda.
