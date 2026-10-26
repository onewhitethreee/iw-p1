# Agrupamiento · Grupo G16 · SI-19 Gestión de Eventos y Congresos

> Propuesta de reparto (4 personas × 2 historias). **Pendiente de acordar en el grupo**: sustituid «Persona A–D» por los nombres reales antes del primer commit.

| Persona | Nombre | Historias | Specs / ramas | Tema |
|---------|--------|-----------|---------------|------|
| **A** | _(nombre)_ | HU-01 + HU-02 | `spec-001`, `spec-002` | Comunicaciones: propuesta y evaluación anónima |
| **B** | _(nombre)_ | HU-03 + HU-05 | `spec-003`, `spec-005` | Programa: sesiones, salas, horarios y agenda personal |
| **C** | _(nombre)_ | HU-04 + HU-08 | `spec-004`, `spec-008` | Inscripción, tarifas, pago y panel de ingresos |
| **D** | _(nombre)_ | HU-06 + HU-07 | `spec-006`, `spec-007` | Acreditación: acceso QR, asistencia y certificado |

Además, `spec-000` (`000-core`) contiene el plan técnico y el modelo de datos **compartidos** por las 8 specs; se hace en grupo en el ordenador de un integrante.

## Por qué así

- **A (1+2)**: ambas trabajan sobre la entidad *Propuesta* (envío → evaluación). El anonimato de la revisión depende de cómo se guarda la autoría al enviar.
- **B (3+5)**: ambas giran en torno a *Sesión* (sala, horario, aforo) y comparten la misma regla de solapamiento temporal.
- **C (4+8)**: el panel muestra justo lo que genera la inscripción: inscripciones, ingresos y desglose por tipo de entrada.
- **D (6+7)**: el certificado se calcula con el registro de asistencia que genera el escaneo QR.

## Dependencias entre personas

- **A → B**: B necesita ponencias aceptadas (HU-02) para montar el programa. Hasta entonces, datos de ejemplo (seed).
- **B → C, D**: las sesiones y salas (HU-03) son la base de la agenda, del panel de ocupación y del control de acceso.
- **C → B, D**: la inscripción confirmada (HU-04) es requisito para la agenda (HU-05) y para el QR (HU-06).
- **B → D**: el 80 % del certificado (HU-07) se calcula sobre la agenda (HU-05).
- **D → C**: la ocupación real del panel (HU-08) sale de los escaneos (HU-06).

## Acuerdos a cerrar entre las 4 personas (van a `000-core`)

1. **Estados de la propuesta**: enviada → en evaluación → aceptada / rechazada. ¿Quién decide aceptar (organizador, por puntuación media)?
2. **Asignación de evaluadores**: ¿quién asigna propuestas al comité y cómo se evita que un evaluador revise su propia propuesta?
3. **Escala de puntuación** de las evaluaciones (p. ej. 1–10).
4. **Tarifas**: importes por tipo de asistente y fecha límite de inscripción temprana (no vienen en la descripción → supuesto).
5. **Pago**: simulado (pasarela ficticia) o integración real; cuándo pasa la inscripción a *confirmada*.
6. **Aforo**: ¿el de la sala o el de la sesión? ¿La agenda reserva plaza o solo el escaneo cuenta?
7. **Solapamiento**: definición común (inicio < fin de la otra y fin > inicio de la otra) usada en HU-03 y HU-05.
8. **Roles y autenticación**: ponente, comité, organizador, asistente, acreditación; una cuenta puede tener varios roles.
9. **Tiempo real del panel**: polling corto o suscripción (tRPC subscriptions / SSE).
10. **Un congreso o varios**: el sistema gestiona 8–10 congresos al año → todas las entidades cuelgan de *Congreso*.

## Trazabilidad

Cada persona trabaja en sus ramas `spec-00X`, firma sus `spec.md` / `plan.md` / `tasks.md` y cierra sus propias tareas. Los commits deben dejar claro el autor.
