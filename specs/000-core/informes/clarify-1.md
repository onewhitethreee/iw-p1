# Informe `/speckit-clarify` · 000-core · iteración 1

- **Fecha**: 2026-11-03
- **Herramienta**: GitHub Spec Kit `1.2.4.dev0` (integración Claude Code, skill `speckit-clarify`)
- **Spec**: [`specs/000-core/spec.md`](../spec.md) · copia previa: [`spec-antes-clarify-1.md`](spec-antes-clarify-1.md) · diferencia: [`clarify-1.diff`](clarify-1.diff)
- **Responsable**: Yangfeng Liu · **Revisión**: autorrevisión diferida (grupo de un integrante)
- **Instrucción**: «Revisa las ambigüedades de la spec 000-core (base común compartida por spec-001…008), especialmente quién puede realizar cada acción, qué datos son válidos, los valores de negocio comunes (acuerdos A1–A10) y qué ocurre ante estados incompatibles. Formula las preguntas necesarias para concretar criterios de aceptación verificables.»

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Historias afectadas | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P1 | ¿Las fechas límite (cierre del plazo de envío y límite de inscripción temprana) se expresan como día completo en la zona del congreso o como instante exacto? | **A** · Día completo en la zona horaria del congreso (hasta las 23:59:59 del día D) | Es lo que entiende un ponente o asistente al leer «hasta el día D»; elimina la ambigüedad por zona horaria y da casos de prueba inequívocos (23:59 sí, 00:00 del día siguiente no). | HU-01 (plazo), HU-04 (tarifa temprana) | Yangfeng Liu (respuesta explícita) |
| P2 | ¿Cómo obtiene un usuario con cuenta el otro rol público (ponente o asistente)? | **A** · Se lo añade él mismo con un clic; los roles organizador, comité y acreditación solo los asigna un organizador | Evita cuentas duplicadas, que romperían «una inscripción por congreso» (FR-017) y el cálculo del certificado; no concede acceso a nada sensible. | HU-01, HU-04 y transversal | Yangfeng Liu (respuesta explícita) |
| P3 | ¿Hacen falta pantallas para gestionar congresos, salas, áreas y tarifas, o se cargan desde los datos de ejemplo? | **A** · Fuera de alcance; se cargan desde el seed | Ninguna de las 8 historias lo pide (Constitución II, «cero alcance fantasma») y el enunciado indica no exigir funcionalidades ajenas al sistema; el seed basta para demostrar todas las historias. | Transversal (alcance) | Opción recomendada, aceptada por delegación expresa del responsable |
| P4 | ¿El rol comité es global o por congreso? | **Global**; la participación en un congreso la determinan las asignaciones | La narrativa habla de «el comité científico» sin distinguir congresos; un rol global es más simple y la regla de anonimato y de no autoevaluación no depende del congreso. | HU-02 | Opción recomendada, aceptada por delegación expresa del responsable |

## Criterios afectados (formato Dado… Cuando… Entonces…)

- **P1 · FR-005a / Edge Cases**: *Dado* un congreso cuyo plazo cierra el día D, *cuando* un ponente envía una propuesta a las 23:59 (hora del congreso) del día D, *entonces* se acepta; *cuando* la envía a las 00:00 del día D+1, *entonces* se rechaza. *Dado* el día límite temprano D, *cuando* un asistente se inscribe a las 23:30 del día D, *entonces* paga la tarifa temprana; a las 00:00 del día D+1, la general.
- **P2 · US1 escenarios 5 y 6**: *Dado* un usuario con solo el rol asistente, *cuando* pulsa «Quiero ser también ponente», *entonces* obtiene el rol ponente y conserva el de asistente. *Dado* un usuario sin rol organizador, *cuando* intenta añadirse comité, organizador o acreditación (también con una petición directa), *entonces* el sistema lo rechaza y sus roles no cambian.
- **P3 · Assumptions**: *Dado* que se quiere cambiar una sala o una tarifa, *cuando* se busca una pantalla para hacerlo, *entonces* no existe: se cambia el seed (decisión documentada, no un defecto).
- **P4 · FR-011**: *Dado* un usuario con rol comité, *cuando* el organizador de cualquier congreso le asigna una propuesta que no es suya, *entonces* la asignación se acepta.

## Secciones modificadas

`## Clarifications` (nueva), User Story 1 (escenarios 5 y 6), Edge Cases, FR-003a (nuevo), FR-005, FR-005a (nuevo), FR-011, FR-016, Assumptions.

## Checklist de calidad

`checklists/requirements.md`: 17/17 → 17/17 elementos superados; ningún cambio de estado.

## Cobertura

| Categoría | Estado |
|-----------|--------|
| Alcance funcional y roles | Resolved (P2, P3) |
| Modelo de datos y ciclo de vida | Clear |
| Flujo e interacción | Clear |
| Atributos no funcionales | Clear (SC-001…SC-004) |
| Integraciones externas | Clear (pago simulado, sin correo) |
| Casos límite | Resolved (P1) |
| Restricciones y compromisos | Clear |
| Terminología | Resolved (P4, «comité» global) |
| Señales de finalización | Clear |
| Marcadores pendientes | Clear (0 `[NEEDS CLARIFICATION]`) |

No se formula una quinta pregunta: no quedan dudas de alto impacto en 000-core. Las restantes son propias de cada historia y se tratarán en su clarify.

## Consecuencias para el plan y las tareas

Las decisiones P1 y P2 dejan desfasados `data-model.md`, `contracts/trpc-api.md` y `tasks.md`, que se actualizan antes de `/speckit-analyze`:

- P1: semántica de `envioAbre`/`envioCierra`/`limiteTemprana` como días completos en la zona del congreso.
- P2: nuevo procedimiento `auth.anadirRolPropio` y botón en la cabecera o el área de cuenta.
