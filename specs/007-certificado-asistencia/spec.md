# Feature Specification: Descargar el certificado de asistencia (HU-07)

**Feature Branch**: `spec-007`

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Base común**: [000-core](../000-core/spec.md) · [modelo de datos](../000-core/data-model.md)

**Input**: User description: "HU-07 · Como asistente, quiero descargar un certificado de asistencia desde mi área personal para justificar mis horas de formación."

## Clarifications

### Session 2026-11-03

- Q: ¿Quién puede ver y descargar el certificado de una inscripción? → A: Solo el titular de la inscripción confirmada, sea cual sea su rol (asistente o ponente inscrito). Nadie más, tampoco el organizador.
- Q: ¿Cómo se muestra un porcentaje que no es entero (p. ej. 2 de 3 sesiones)? → A: Truncado a entero hacia abajo («66 %»), para no mostrar nunca «80 %» a quien no llega; la decisión de disponibilidad usa la comparación exacta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descargar el certificado si he asistido al 80 % (Priority: P1)

Al terminar el congreso, el asistente entra en su área personal y ve su porcentaje de asistencia sobre las sesiones de
su agenda. Si es al menos el 80 %, descarga un certificado en PDF con sus datos, el congreso y las horas de formación.

**Why this priority**: es la utilidad final del registro de asistencia que describe la narrativa.

**Independent Test**: con el congreso finalizado de ejemplo, `asistente1` (asistió a 4 de 5 sesiones de su agenda, 80 %) descarga el PDF; `asistente2` (3 de 5, 60 %) ve el motivo y no puede descargarlo.

**Acceptance Scenarios**:

1. **Given** un congreso finalizado y un asistente que asistió a 4 de las 5 sesiones de su agenda (80 %), **When** abre «Certificado», **Then** ve «80 % (4 de 5 sesiones)» y el botón «Descargar certificado», que entrega un PDF con su nombre, el congreso, las fechas, las sesiones asistidas y las horas de formación.
2. **Given** un asistente que asistió a 3 de 5 sesiones (60 %), **When** abre «Certificado», **Then** ve «No disponible: has asistido al 60 % de las sesiones de tu agenda (3 de 5); se necesita al menos el 80 %» y no hay botón de descarga.
3. **Given** el mismo asistente del caso 2, **When** pide el PDF con una petición directa a la URL de descarga, **Then** el servidor lo rechaza con el mismo motivo.
4. **Given** un congreso que aún no ha finalizado, **When** el asistente abre «Certificado», **Then** ve «Disponible cuando termine el congreso (fecha)» y su porcentaje provisional.
5. **Given** un asistente con la agenda vacía, **When** abre «Certificado», **Then** ve «No disponible: tu agenda no tiene sesiones».
6. **Given** un usuario (incluido un organizador) que intenta descargar el certificado de otra persona, **When** hace la petición, **Then** el sistema lo rechaza (Clarifications P1).
7. **Given** un usuario sin inscripción confirmada en el congreso, **When** abre «Certificado», **Then** ve que no tiene inscripción confirmada.

### Edge Cases

- Umbral exacto: 80,0 % se acepta; 79,9 % no (comparación sin redondeo: `asistidas × 100 ≥ 80 × total`). El porcentaje se muestra truncado a entero (Clarifications P2): 2 de 3 → «66 %».
- Asistencias a sesiones fuera de la agenda no cuentan ni en el numerador ni en el denominador.
- Las horas de formación son la suma de la duración de las sesiones de la agenda a las que asistió (p. ej. «6 h 30 min»).
- El certificado se puede descargar varias veces; siempre refleja los datos actuales.
- Si una sesión de la agenda se quitó del programa antes del congreso, no está en la agenda y no cuenta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El certificado MUST estar disponible solo cuando el congreso ha finalizado (`ahora ≥ fin`).
- **FR-002**: El sistema MUST calcular el porcentaje como sesiones de la agenda con asistencia registrada / sesiones de la agenda, y exigir ≥ 80 %.
- **FR-003**: El área personal MUST mostrar el porcentaje (entero truncado hacia abajo, Clarifications P2), el número de sesiones asistidas y el total, y, si no está disponible, el motivo.
- **FR-004**: El certificado MUST ser un PDF descargable con: nombre del asistente, congreso, fechas y sede, lista de sesiones asistidas y total de horas de formación.
- **FR-005**: La descarga MUST volver a comprobar las condiciones en el servidor y solo permitirla al titular de la inscripción confirmada, con independencia de su rol; ningún otro usuario (tampoco el organizador) puede obtenerla (Clarifications P1).
- **FR-006**: Sin inscripción confirmada o con la agenda vacía, el certificado MUST no estar disponible y explicar el motivo.

### Key Entities

- **Asistencia**, **EntradaAgenda**, **Inscripción**, **Congreso** (fin). Ver [data-model.md](../000-core/data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los asistentes con ≥ 80 % pueden descargar el certificado y el 100 % de los que no lo cumplen reciben el motivo.
- **SC-002**: El PDF se genera en menos de 3 segundos.
- **SC-003**: El porcentaje mostrado coincide con el número de asistencias registradas por el personal de acreditación (HU-06).

## Assumptions

- El certificado no lleva firma digital ni código de verificación en la versión 1.
- La duración de cada sesión es su intervalo programado, no el tiempo real que estuvo el asistente.
- No se envía por correo; solo se descarga desde el área personal.
