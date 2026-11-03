# Historias de usuario · SI-19 Gestión de Eventos y Congresos

Extraídas de [descripcion-sistema.md](descripcion-sistema.md). Formato: «Como [rol], quiero [acción] para [beneficio]».
Los criterios de aceptación son un **borrador inicial**; la versión vigente está en `specs/00X-*/spec.md` (generadas el 2026-11-03) y se concretará con `/speckit-clarify`.

Responsable de las 8 historias: **Yangfeng Liu** (ver [agrupamiento.md](agrupamiento.md)).

## Actores

| Actor | Descripción |
|-------|-------------|
| Ponente | Envía propuestas de ponencia durante la llamada a comunicaciones. |
| Miembro del comité científico | Evalúa de forma anónima las propuestas que tiene asignadas. |
| Organizador | Monta y publica el programa, consulta el panel en tiempo real. |
| Asistente | Se inscribe, paga, construye su agenda y descarga su certificado. |
| Personal de acreditación | Escanea el QR de los asistentes a la entrada de cada sala. |
| Visitante | Consulta el programa público sin iniciar sesión. |

---

## HU-01 · Enviar propuesta de ponencia
**Como** ponente, **quiero** enviar una propuesta de ponencia con un resumen y su área temática **para** que el comité científico la valore.

- Solo se aceptan propuestas mientras el plazo de envío del congreso está abierto.
- Cerrado el plazo, el sistema rechaza cualquier propuesta nueva y lo explica.
- La propuesta debe incluir título, resumen y un área temática válida del congreso.
- El ponente puede ver sus propuestas y su estado.

## HU-02 · Evaluar propuestas de forma anónima
**Como** miembro del comité científico, **quiero** evaluar las propuestas que tengo asignadas con una puntuación y comentarios **para** seleccionar las mejores ponencias.

- El evaluador solo ve las propuestas que tiene asignadas.
- La revisión es anónima: nunca se muestra el autor de la propuesta.
- Cada evaluación tiene una puntuación (escala a acordar) y comentarios.
- Una propuesta no puede aceptarse hasta tener al menos dos evaluaciones.

## HU-03 · Montar y publicar el programa
**Como** organizador, **quiero** asignar cada ponencia aceptada a una sala y un horario y publicar el programa **para** que los asistentes y el público lo consulten.

- Solo se programan ponencias aceptadas.
- El sistema impide que un mismo ponente tenga dos sesiones que se solapen.
- El sistema impide que dos sesiones ocupen la misma sala a la misma hora.
- El programa publicado es accesible sin iniciar sesión, renderizado en servidor y con metadatos para buscadores (SEO).

## HU-04 · Inscribirse y pagar la entrada
**Como** asistente, **quiero** inscribirme eligiendo mi tipo de entrada y pagarla **para** asistir al congreso.

- La tarifa depende del tipo de asistente (profesional, socio, estudiante) y de la fecha de inscripción (precio reducido por inscripción temprana).
- La inscripción queda pendiente hasta que se paga; solo entonces se confirma.
- Una vez confirmada, el asistente obtiene su acreditación con código QR.

## HU-05 · Construir mi agenda personal
**Como** asistente inscrito, **quiero** añadir a mi agenda las sesiones a las que quiero ir **para** organizar mi congreso.

- Solo pueden construir agenda los asistentes con inscripción confirmada.
- No se pueden añadir dos sesiones que se solapen en el tiempo.
- No se puede añadir una sesión cuyo aforo ya esté completo.
- Puedo quitar de mi agenda las sesiones que aún no han empezado.

## HU-06 · Controlar el acceso a la sala con QR
**Como** personal de acreditación, **quiero** escanear el QR del asistente a la entrada de la sala **para** controlar el aforo y registrar la asistencia real.

- Si la sala ha alcanzado su aforo, se rechaza la entrada.
- Un QR no válido o de una inscripción no confirmada se rechaza.
- Cada entrada aceptada queda registrada como asistencia del asistente a esa sesión.

## HU-07 · Descargar el certificado de asistencia
**Como** asistente, **quiero** descargar un certificado de asistencia desde mi área personal **para** justificar mis horas de formación.

- Solo está disponible al terminar el congreso.
- Solo se puede descargar si consta asistencia a al menos el 80 % de las sesiones de la agenda.
- Si no se cumple, el sistema explica el motivo y el porcentaje alcanzado.

## HU-08 · Consultar el panel del congreso en tiempo real
**Como** organizador, **quiero** un panel con inscripciones, ingresos y ocupación de cada sesión, con desglose por tipo de entrada **para** tomar decisiones sobre la marcha.

- Muestra inscripciones e ingresos totales y desglosados por tipo de entrada.
- Muestra la ocupación de cada sesión respecto a su aforo.
- Los datos se actualizan en tiempo real (sin recargar la página).
- Permite detectar sesiones llenas y moverlas a una sala más grande.
