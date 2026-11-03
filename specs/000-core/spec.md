# Feature Specification: Núcleo común de Congresalia (000-core)

**Feature Branch**: `main` (base común)

**Created**: 2026-11-03

**Status**: Draft

**Responsable**: Yangfeng Liu

**Input**: User description: "Crea una spec 000-core que sea la fuente única de verdad compartida por las 8 specs: vocabulario, entidades (Congreso, Área temática, Propuesta, Evaluación, Sala, Sesión, Tipo de entrada/Tarifa, Inscripción, Pago, Agenda, Asistencia, Usuario y roles), estados y valores de negocio, y los acuerdos de docs/agrupamiento.md. No añade pantallas propias. Usa docs/descripcion-sistema.md como narrativa."

> Esta spec **no es una historia de usuario**. Define el vocabulario, las entidades, los estados y las reglas
> transversales que comparten spec-001 … spec-008. Ninguna de esas specs puede redefinir lo que aquí se fija
> (Constitución, principio V). Las únicas capacidades propias son el acceso con cuenta y los roles, que todas
> las historias necesitan.

## Clarifications

### Session 2026-11-03

- Q: ¿Las fechas límite (cierre del plazo de envío y límite de inscripción temprana) se expresan como día completo en la zona del congreso o como instante exacto? → A: Día completo en la zona horaria del congreso: «hasta el día D» incluye hasta las 23:59:59 (hora del congreso) del día D.
- Q: ¿Cómo obtiene un usuario con cuenta el otro rol público (ponente o asistente)? → A: El propio usuario puede añadirse el rol ponente o asistente desde su cuenta con un clic; los roles organizador, comité y acreditación solo los asigna un organizador.
- Q: ¿El organizador necesita pantallas para dar de alta y editar congresos, salas, áreas temáticas y tarifas, o se cargan desde los datos de ejemplo? → A: Fuera de alcance en la versión 1: se cargan desde los datos de ejemplo, sin pantallas de gestión.
- Q: ¿El rol comité es global o hay que ser miembro del comité de cada congreso concreto? → A: Global: un usuario con rol comité puede recibir asignaciones de cualquier congreso; la participación en un congreso la determinan sus asignaciones.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceder con mi cuenta y mis roles (Priority: P1)

Cualquier persona puede crear una cuenta con correo y contraseña (como ponente o asistente) e iniciar sesión.
Según sus roles, la aplicación le muestra las zonas a las que tiene acceso y le impide el resto.

**Why this priority**: todas las historias (HU-01…HU-08) dependen de saber quién actúa y con qué rol.

**Independent Test**: registrar una cuenta, iniciar sesión y comprobar que solo se ven las zonas de su rol;
intentar entrar en una zona de otro rol y comprobar el rechazo.

**Acceptance Scenarios**:

1. **Given** una persona sin cuenta, **When** se registra con nombre, correo y contraseña válidos, **Then** se crea la cuenta con el rol elegido (ponente o asistente) y queda con la sesión iniciada.
2. **Given** un correo ya registrado, **When** alguien intenta registrarse con él, **Then** el sistema lo rechaza indicando que el correo ya existe.
3. **Given** un usuario con solo el rol asistente, **When** intenta abrir una zona o ejecutar una operación de organizador, **Then** el sistema la rechaza (también si la petición se hace sin pasar por la interfaz).
4. **Given** un usuario con roles ponente y comité, **When** inicia sesión, **Then** puede usar las zonas de ambos roles.
5. **Given** un usuario con solo el rol asistente, **When** pulsa «Quiero ser también ponente» en su cuenta, **Then** obtiene el rol ponente sin crear otra cuenta y conserva el de asistente.
6. **Given** un usuario sin rol organizador, **When** intenta añadirse a sí mismo el rol comité, organizador o acreditación (también con una petición directa), **Then** el sistema lo rechaza y sus roles no cambian.

---

### User Story 2 - Consultar congresos disponibles (Priority: P2)

Cualquier visitante ve la lista de congresos con sus fechas y su estado (llamada abierta, programa publicado,
en curso, finalizado), que sirve de punto de entrada a las historias.

**Why this priority**: el sistema gestiona varios congresos y cada historia trabaja dentro de uno.

**Independent Test**: con los datos de ejemplo, abrir la portada sin iniciar sesión y ver los congresos.

**Acceptance Scenarios**:

1. **Given** dos congresos en los datos de ejemplo, **When** un visitante abre la portada, **Then** ve ambos con nombre, fechas, sede y fase actual.

### Edge Cases

- Un usuario sin ningún rol operativo (solo cuenta) solo ve las páginas públicas.
- Si se retira un rol a un usuario con la sesión abierta, la siguiente operación protegida se rechaza.
- Fechas y horas se muestran siempre en la zona horaria del congreso (Europe/Madrid por defecto).
- Una inscripción creada a las 23:30 (hora del congreso) del día límite temprano paga la tarifa temprana; a las 00:00 del día siguiente, la general. Un ponente que envía a las 23:59 del día de cierre es aceptado; a las 00:00 del día siguiente, rechazado.

## Requirements *(mandatory)*

### Vocabulario común

| Término | Significado |
|---------|-------------|
| **Congreso** | Evento organizado por Congresalia, con fechas de celebración, sede, zona horaria, plazo de envío de propuestas y fecha límite de inscripción temprana. |
| **Área temática** | Clasificación de las propuestas dentro de un congreso (p. ej. «Pediatría», «Innovación docente»). |
| **Propuesta** | Ponencia enviada por un ponente: título, resumen y área temática. Tiene un único autor (el ponente que la envía). |
| **Evaluación** | Valoración de una propuesta por un miembro del comité: puntuación 1–10 y comentarios. |
| **Asignación** | Encargo de evaluar una propuesta concreta a un miembro del comité. |
| **Sala** | Espacio físico de la sede de un congreso con un aforo (número máximo de personas). |
| **Sesión** | Una ponencia aceptada colocada en una sala y en un intervalo de tiempo (inicio y fin). |
| **Programa** | Conjunto de sesiones de un congreso; puede estar en borrador o publicado. |
| **Tarifa** | Precio de la entrada para un tipo de asistente, con importe temprano e importe general. |
| **Inscripción** | Alta de un asistente en un congreso con un tipo de asistente y un importe fijado. |
| **Pago** | Intento de pago (simulado) de una inscripción. |
| **Acreditación** | Código QR único de una inscripción confirmada que el asistente lleva en el móvil. |
| **Agenda** | Sesiones que un asistente ha reservado. |
| **Asistencia** | Registro de que una acreditación ha entrado en una sesión. |
| **Certificado** | Documento descargable que acredita la asistencia y las horas de formación. |

### Functional Requirements

**Cuentas y roles**

- **FR-001**: El sistema MUST permitir registrarse con nombre, correo (único) y contraseña (mínimo 8 caracteres), eligiendo el rol ponente o asistente.
- **FR-002**: El sistema MUST reconocer los roles `ORGANIZADOR`, `COMITE`, `PONENTE`, `ASISTENTE` y `ACREDITACION`; una cuenta puede tener varios.
- **FR-003**: Los roles `ORGANIZADOR`, `COMITE` y `ACREDITACION` MUST asignarlos solo un organizador (o venir de los datos de ejemplo).
- **FR-003a**: Un usuario con sesión MUST poder añadirse a sí mismo el rol `PONENTE` o `ASISTENTE` que le falte, sin crear otra cuenta; nunca otro rol.
- **FR-004**: Toda operación protegida MUST comprobar el rol en el servidor, no solo en la interfaz (Constitución IV).

**Congresos**

- **FR-005**: Cada congreso MUST tener: nombre, identificador legible para la URL (slug), descripción, sede, zona horaria, fecha y hora de inicio y fin, **día** de apertura y **día** de cierre del plazo de envío de propuestas, y **día** límite de inscripción temprana.
- **FR-005a**: Los días límite se interpretan como días completos en la zona horaria del congreso: el plazo de envío está abierto desde las 00:00:00 del día de apertura hasta las 23:59:59 del día de cierre, y la tarifa temprana se aplica hasta las 23:59:59 del día límite (hora del congreso). Las pantallas muestran solo el día («hasta el 4 de octubre»).
- **FR-006**: Todas las entidades de negocio (áreas, propuestas, salas, sesiones, tarifas, inscripciones…) MUST pertenecer a un congreso (acuerdo A10).
- **FR-007**: La fase de un congreso MUST deducirse de sus fechas: *llamada abierta* (dentro del plazo de envío), *en preparación*, *en curso* (entre inicio y fin) y *finalizado* (después del fin).

**Reglas de negocio compartidas** (se aplican en las specs que se indican)

- **FR-010** (A1, spec-001/002/003): Estados de la propuesta: `ENVIADA` → `EN_EVALUACION` → `ACEPTADA` | `RECHAZADA`. Solo el organizador decide, y solo con ≥ 2 evaluaciones completadas.
- **FR-011** (A2, spec-002): Solo el organizador asigna evaluadores con rol comité (rol global, válido para cualquier congreso); nunca al autor de la propuesta ni dos veces al mismo evaluador.
- **FR-012** (A3, spec-002): La puntuación es un entero de 1 a 10 y los comentarios son obligatorios; una evaluación por evaluador y propuesta.
- **FR-013** (anonimato, spec-002): Nada de lo que ve un evaluador (pantallas ni respuestas del servidor) MUST incluir el nombre, el correo ni el identificador del autor.
- **FR-014** (A7, spec-003/005): Dos intervalos `[inicio, fin)` se solapan si `inicioA < finB` y `inicioB < finA`.
- **FR-015** (A6, spec-005/006/008): El aforo de una sesión es el aforo de su sala. Las agendas que incluyen una sesión no pueden superar su aforo; las asistencias registradas en una sesión tampoco.
- **FR-016** (A4, spec-004): La tarifa aplicable se determina por tipo de asistente y por el momento de creación de la inscripción: temprana si es anterior o igual a las 23:59:59 del día límite temprano en la zona del congreso (FR-005a); el importe queda fijado en la inscripción.
- **FR-017** (A5, spec-004): Estados de la inscripción: `PENDIENTE_PAGO` → `CONFIRMADA`; un asistente tiene como máximo una inscripción por congreso.
- **FR-018** (spec-005/006/007): Solo una inscripción `CONFIRMADA` tiene acreditación QR, agenda y derecho a certificado.
- **FR-019** (spec-007): Umbral de certificado: asistencias a sesiones de la agenda / sesiones de la agenda ≥ 80 %, con el congreso finalizado.
- **FR-020** (A9, spec-008): Los datos del panel se refrescan solos al menos cada 5 segundos.
- **FR-021** (Constitución VI): Importes en euros con formato español (p. ej. «1.250,00 €»); textos en español de España.

**Datos de ejemplo**

- **FR-022**: El sistema MUST incluir datos de ejemplo reproducibles: al menos tres congresos (uno con la llamada abierta, otro en curso y otro finalizado, con fechas relativas al día de ejecución), áreas, salas con aforos distintos (incluida una sala pequeña), usuarios de cada rol, propuestas en todos los estados, tarifas, inscripciones pagadas y pendientes, agendas y asistencias suficientes para demostrar las ocho historias.

### Key Entities *(include if feature involves data)*

- **Usuario**: persona con cuenta (nombre, correo, contraseña cifrada) y uno o varios roles.
- **Congreso**: evento; agrupa todo lo demás.
- **ÁreaTemática**: pertenece a un congreso.
- **Propuesta**: de un congreso y un área; tiene un autor (Usuario ponente) y un estado.
- **Asignación**: une una propuesta con un evaluador (Usuario comité).
- **Evaluación**: una por asignación; puntuación y comentarios.
- **Sala**: de un congreso, con aforo.
- **Sesión**: una propuesta aceptada en una sala con inicio y fin.
- **Tarifa**: de un congreso y un tipo de asistente; importe temprano e importe general.
- **Inscripción**: de un usuario asistente en un congreso; tipo de asistente, importe fijado, estado y código de acreditación.
- **Pago**: de una inscripción; resultado del pago simulado.
- **EntradaAgenda**: une una inscripción confirmada con una sesión.
- **Asistencia**: une una inscripción con una sesión; momento del escaneo y quién lo hizo.

El detalle de campos, restricciones y transiciones está en [data-model.md](data-model.md).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las reglas FR-010 … FR-019 se rechazan también cuando la petición se envía directamente al servidor sin pasar por la interfaz.
- **SC-002**: Ninguna de las specs 001–008 define una entidad, estado o valor de negocio que no esté en este documento o en su modelo de datos.
- **SC-003**: Con los datos de ejemplo se puede demostrar cada una de las ocho historias sin crear datos a mano.
- **SC-004**: Un usuario nuevo puede registrarse e iniciar sesión en menos de 1 minuto.

## Assumptions

- Los acuerdos A1–A10 de [docs/agrupamiento.md](../../docs/agrupamiento.md) son supuestos del grupo donde la narrativa no decide.
- **Decisión (Clarifications 2026-11-03)**: la gestión de congresos, salas, áreas y tarifas (alta, edición, borrado) queda fuera de alcance; se cargan desde los datos de ejemplo y no tienen pantalla propia (Constitución II). Cambiar sus datos requiere modificar el seed.
- No se envían correos electrónicos (confirmaciones, recuperación de contraseña): fuera de alcance en la versión 1.
- Una propuesta tiene un único autor; los coautores quedan fuera de alcance.
- La pasarela de pago es simulada (acuerdo A5); no se tratan datos bancarios reales.
