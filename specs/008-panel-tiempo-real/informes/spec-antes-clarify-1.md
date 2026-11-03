# Feature Specification: Consultar el panel del congreso en tiempo real (HU-08)

**Feature Branch**: `spec-008`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-08 · Como organizador, quiero un panel con inscripciones, ingresos y ocupación de cada sesión, con desglose por tipo de entrada, para tomar decisiones sobre la marcha."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver inscripciones e ingresos con desglose por tipo de entrada (Priority: P1)

El organizador abre el panel de un congreso y ve el número de inscripciones (confirmadas y pendientes) y los
ingresos, en total y desglosados por tipo de asistente y tarifa (temprana o general).

**Why this priority**: es la primera información que pide la narrativa para el panel.

**Independent Test**: con los datos de ejemplo, comprobar que los totales del panel coinciden con las inscripciones y pagos del seed; confirmar una inscripción nueva en otra ventana y ver el cambio en ≤ 5 s sin recargar.

**Acceptance Scenarios**:

1. **Given** un congreso con inscripciones, **When** el organizador abre el panel, **Then** ve: inscripciones confirmadas, pendientes de pago, ingresos totales (suma de pagos aprobados) y una tabla por tipo de asistente (profesional, socio, estudiante) con nº de inscripciones e ingresos, separando tarifa temprana y general.
2. **Given** el panel abierto, **When** otro asistente completa un pago, **Then** en un máximo de 5 segundos, sin recargar la página, las cifras se actualizan y se muestra la hora de la última actualización.
3. **Given** un usuario que no es organizador, **When** intenta abrir el panel o consultar sus datos con una petición directa, **Then** el sistema lo rechaza.
4. **Given** un congreso sin inscripciones, **When** se abre el panel, **Then** muestra ceros, no errores.

---

### User Story 2 - Ver la ocupación de cada sesión (Priority: P1)

El panel muestra cada sesión con su sala, horario, reservas en agendas y asistencias reales frente al aforo, y marca
las sesiones completas o casi completas (≥ 90 %).

**Why this priority**: es lo que permite «tomar decisiones sobre la marcha».

**Independent Test**: admitir una entrada en el escáner (HU-06) y ver en el panel que sube la asistencia de esa sesión en ≤ 5 s.

**Acceptance Scenarios**:

1. **Given** sesiones programadas, **When** el organizador abre el panel, **Then** ve por sesión: título, sala, horario, reservas / aforo, asistencias / aforo y porcentaje, con indicador «Completa» (100 %) o «Casi completa» (≥ 90 %).
2. **Given** el panel abierto, **When** el personal admite una entrada en una sesión, **Then** la asistencia de esa sesión se actualiza en ≤ 5 s.
3. **Given** el panel, **When** el organizador ordena o filtra por «solo completas o casi completas», **Then** ve solo esas sesiones.

---

### User Story 3 - Cambiar una sesión a una sala más grande (Priority: P2)

Desde una sesión llena del panel, el organizador ve las salas libres en ese horario con más aforo y mueve la sesión a una de ellas.

**Why this priority**: es el ejemplo de decisión que da la narrativa; reutiliza la regla de mover de HU-03.

**Independent Test**: con la sesión de «Aula 3» (aforo 2) completa, mover a «Auditorio» (libre a esa hora) y ver el nuevo aforo en el panel.

**Acceptance Scenarios**:

1. **Given** una sesión completa, **When** el organizador pulsa «Cambiar de sala», **Then** ve solo las salas sin otra sesión en ese horario y con aforo mayor o igual que las reservas actuales, con su aforo.
2. **Given** una sala elegida de esa lista, **When** confirma el cambio, **Then** la sesión pasa a la nueva sala, el panel muestra el nuevo aforo y el programa público se actualiza.
3. **Given** que otra sesión ocupa esa sala entre que se mostró la lista y se confirmó, **When** confirma, **Then** el sistema rechaza el cambio por solapamiento de sala y la sesión se queda donde estaba.

### Edge Cases

- Las asistencias ya registradas se mantienen al cambiar de sala (pertenecen a la sesión, no a la sala).
- Si la conexión falla durante el refresco, el panel mantiene los últimos datos y avisa «Sin actualizar desde hh:mm:ss».
- Ingresos: solo cuentan pagos aprobados; las inscripciones pendientes no suman.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo el `ORGANIZADOR` MUST poder ver el panel y sus datos.
- **FR-002**: El panel MUST mostrar inscripciones confirmadas y pendientes, e ingresos (suma de pagos aprobados), en total y por tipo de asistente y tarifa.
- **FR-003**: El panel MUST mostrar por sesión: reservas en agendas, asistencias registradas, aforo de la sala y porcentaje, y marcar las completas (100 %) y casi completas (≥ 90 %).
- **FR-004**: Los datos MUST refrescarse solos cada 5 segundos como máximo sin recargar la página, mostrando la hora del último dato (A9).
- **FR-005**: El organizador MUST poder mover una sesión a otra sala desde el panel; las opciones MUST limitarse a salas libres en ese horario con aforo ≥ reservas, y el servidor MUST volver a validar el cambio con las reglas de HU-03 (FR-004 a FR-006 de spec-003).
- **FR-006**: Importes en euros con formato español.

### Key Entities

- **Inscripción**, **Pago**, **Sesión**, **Sala**, **EntradaAgenda**, **Asistencia** (solo lectura, salvo el cambio de sala). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cambio (pago, reserva o escaneo) aparece en el panel en ≤ 5 segundos.
- **SC-002**: Los totales del panel coinciden al céntimo con la suma de pagos aprobados en la base de datos.
- **SC-003**: El organizador cambia una sesión llena de sala en menos de 1 minuto desde el panel.
- **SC-004**: El panel carga en menos de 2 segundos con 1.000 inscripciones y 50 sesiones.

## Assumptions

- «Tiempo real» se interpreta como refresco automático cada 5 segundos (A9).
- El desglose «por tipo de entrada» se entiende como tipo de asistente × tarifa (temprana/general).
- No se exportan los datos (CSV, Excel) en la versión 1.
