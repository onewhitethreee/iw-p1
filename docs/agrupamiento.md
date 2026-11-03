# Agrupamiento · Grupo G16 · SI-19 Gestión de Eventos y Congresos

> El grupo G16 tiene **un único integrante**, que se responsabiliza de las 8 historias de usuario.
> El enunciado prevé 4 personas × 2 historias; se mantiene la misma organización (una spec y una rama por
> historia) para que la trazabilidad sea idéntica a la de un grupo completo.

| Integrante | Historias | Specs / ramas | Tema |
|------------|-----------|---------------|------|
| **Yangfeng Liu** | HU-01, HU-02 | `spec-001`, `spec-002` | Comunicaciones: propuesta y evaluación anónima |
| **Yangfeng Liu** | HU-03, HU-05 | `spec-003`, `spec-005` | Programa: sesiones, salas, horarios y agenda personal |
| **Yangfeng Liu** | HU-04, HU-08 | `spec-004`, `spec-008` | Inscripción, tarifas, pago y panel en tiempo real |
| **Yangfeng Liu** | HU-06, HU-07 | `spec-006`, `spec-007` | Acreditación: acceso con QR, asistencia y certificado |

`specs/000-core` contiene el plan técnico y el modelo de datos **compartidos** por las 8 specs y vive en `main`.

| Spec | Carpeta | Rama | Responsable | Revisor |
|------|---------|------|-------------|---------|
| spec-000 | `specs/000-core` | `main` | Yangfeng Liu | — |
| spec-001 | `specs/001-enviar-propuesta` | `spec-001` | Yangfeng Liu | Autorrevisión diferida (ver nota) |
| spec-002 | `specs/002-evaluar-propuestas` | `spec-002` | Yangfeng Liu | Autorrevisión diferida |
| spec-003 | `specs/003-programa-congreso` | `spec-003` | Yangfeng Liu | Autorrevisión diferida |
| spec-004 | `specs/004-inscripcion-pago` | `spec-004` | Yangfeng Liu | Autorrevisión diferida |
| spec-005 | `specs/005-agenda-personal` | `spec-005` | Yangfeng Liu | Autorrevisión diferida |
| spec-006 | `specs/006-acceso-qr` | `spec-006` | Yangfeng Liu | Autorrevisión diferida |
| spec-007 | `specs/007-certificado-asistencia` | `spec-007` | Yangfeng Liu | Autorrevisión diferida |
| spec-008 | `specs/008-panel-tiempo-real` | `spec-008` | Yangfeng Liu | Autorrevisión diferida |

**Nota sobre la revisión cruzada.** El enunciado pide que «otro integrante» revise los criterios de cada
historia. Al ser un grupo de una persona, esa revisión se sustituye por una **autorrevisión diferida**: cada
spec se revisa en una sesión distinta a la de su redacción, usando la lista de comprobación
`checklists/requirements.md` y los informes de `/speckit-analyze`. Se deja constancia de ello en la memoria.

## Por qué este orden de trabajo

Aunque todas las historias son del mismo integrante, se agrupan por afinidad de datos para implementarlas en bloques:

- **HU-01 + HU-02**: las dos trabajan sobre la entidad *Propuesta* (envío → evaluación). El anonimato de la revisión depende de cómo se guarda la autoría al enviar.
- **HU-03 + HU-05**: las dos giran en torno a *Sesión* (sala, horario, aforo) y comparten la misma regla de solapamiento temporal.
- **HU-04 + HU-08**: el panel muestra justo lo que genera la inscripción: inscripciones, ingresos y desglose por tipo de entrada.
- **HU-06 + HU-07**: el certificado se calcula con el registro de asistencia que genera el escaneo QR.

Orden de implementación previsto: 000-core → 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008.

## Dependencias entre historias

- **HU-02 → HU-03**: el programa solo se monta con ponencias aceptadas. Hasta entonces se usan datos de ejemplo (seed).
- **HU-03 → HU-05, HU-06, HU-08**: las sesiones y salas son la base de la agenda, del control de acceso y del panel de ocupación.
- **HU-04 → HU-05, HU-06**: la inscripción confirmada es requisito para la agenda y para la acreditación QR.
- **HU-05 → HU-07**: el 80 % del certificado se calcula sobre la agenda.
- **HU-06 → HU-07, HU-08**: la asistencia real (escaneos) alimenta el certificado y la ocupación del panel.

## Acuerdos cerrados (se aplican en `000-core`)

Fecha: 2026-11-03. Son supuestos razonables donde la narrativa no decide; se pueden revisar con `/speckit-clarify`.

| # | Tema | Decisión |
|---|------|----------|
| A1 | Estados de la propuesta | `ENVIADA` → `EN_EVALUACION` (al asignar el primer evaluador) → `ACEPTADA` / `RECHAZADA`. Decide el **organizador**, viendo la puntuación media, y solo si la propuesta tiene **≥ 2 evaluaciones** completadas. |
| A2 | Asignación de evaluadores | La hace el organizador entre los usuarios con rol *comité*. El sistema impide asignar una propuesta a su propio autor y asignar dos veces al mismo evaluador. |
| A3 | Escala de puntuación | Entero de **1 a 10**; los comentarios son obligatorios. Un evaluador hace una sola evaluación por propuesta y no puede modificarla una vez decidida la propuesta. |
| A4 | Tarifas | Cada congreso define, por tipo de asistente (profesional, socio, estudiante), un **precio temprano** y un **precio general**, y una **fecha límite de inscripción temprana**. Se aplica la tarifa vigente en el momento de crear la inscripción y queda fijada. |
| A5 | Pago | **Pasarela simulada** dentro de la aplicación. La inscripción nace `PENDIENTE_PAGO` y pasa a `CONFIRMADA` cuando el pago simulado se completa. Un pago rechazado deja la inscripción pendiente. |
| A6 | Aforo | El aforo de una sesión es el **aforo de la sala** donde está. La agenda **reserva plaza**: una sesión no admite más agendas que su aforo. En la puerta, el escaneo rechaza la entrada cuando las asistencias registradas en esa sesión alcanzan el aforo. |
| A7 | Solapamiento | Dos intervalos se solapan si `inicioA < finB` y `inicioB < finA` (intervalos semiabiertos: una sesión que empieza justo cuando otra acaba **no** se solapa). Misma regla en HU-03 (ponente y sala) y HU-05 (agenda). |
| A8 | Roles y autenticación | Correo y contraseña. Roles: `ORGANIZADOR`, `COMITE`, `PONENTE`, `ASISTENTE`, `ACREDITACION`. Una cuenta puede tener varios roles. Cualquiera puede registrarse como ponente o asistente; los demás roles los da un organizador (o vienen del seed). |
| A9 | Tiempo real del panel | **Sondeo (polling) cada 5 s** desde el cliente, sin recargar la página. |
| A10 | Un congreso o varios | El sistema gestiona **varios congresos**; todas las entidades de negocio cuelgan de *Congreso*. |

## Trazabilidad

Todo el trabajo se firma como `Yangfeng Liu`. Cada spec se desarrolla en su rama `spec-00X`, con sus
`spec.md`, `plan.md` y `tasks.md`, y se integra en `main` cuando la historia está resuelta.
