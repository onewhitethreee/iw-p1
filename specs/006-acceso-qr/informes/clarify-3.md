# Informe `/speckit-clarify` · spec-006 (HU-06 Acceso con QR) · iteración 3 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-006-clarify-2` · **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-3.md`](spec-antes-clarify-3.md) · diferencia: [`clarify-3.diff`](clarify-3.diff)
- **Responsable**: Yangfeng Liu · **Revisión**: autorrevisión diferida (grupo de una persona)
- **Instrucción**: «Revisa las ambigüedades de la historia sobre la aplicación ya funcionando, especialmente quién puede realizar cada acción, qué datos son válidos y qué ocurre ante estados incompatibles. Formula las preguntas necesarias para concretar criterios de aceptación verificables.»
- **Diferencia con las iteraciones anteriores**: se hicieron antes de implementar o por hallazgos de analyze. Esta se hace sobre la versión funcional, como pide el §5.1, y **cada respuesta la ha elegido el responsable** (no se acepta la recomendación por delegación).

## Prueba de la versión funcional (paso 1 de §5.1)

- **Commit de referencia**: `7e59b84` (`main`, 2026-11-04) · **Herramienta**: Spec Kit `1.2.4.dev0` (skill `speckit-clarify`)
- **Suite ejecutada antes de clarify**: dominio 42/42 · integración 166/166 · e2e **46/46** (`E2E_PORT=3300 pnpm test:e2e`, seed recargado) · lint y typecheck sin errores.
- *Nota*: la primera ejecución del e2e dio 8 fallos de inicio de sesión. La causa era que Playwright reutilizó un `next start` antiguo que seguía en el puerto 3100 (`reuseExistingServer`). Con un servidor limpio, todo en verde. No es un defecto de la aplicación ([#10](https://github.com/onewhitethreee/iw-p1/issues/10)).

## Tres situaciones revisadas

| Situación | Escenario | Evidencia en la versión funcional | Resultado |
|-----------|-----------|-----------------------------------|-----------|
| Recorrido habitual | US1-1 admitido, contador +1; US1-5 «Ya registrado» | e2e `006-acceso` US1-1/US1-5/US2-1 | ✔ |
| Entrada inválida / límite | US1-3 código inventado; US1-2 aforo completo | e2e US1-3 y US1-2 + `integration/006/escanear.test.ts` | ✔ |
| Permisos | US1-6 un asistente no entra en acreditación | e2e US1-6 | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P4 | Un asistente ya registrado en A se escanea en B, que se solapa con A. ¿Se le admite? | No: «Ya registrado en «A» a esta hora» | Impedir que una misma persona se registre en dos sesiones a la vez evita inflar los datos de ocupación y garantiza que el porcentaje de asistencia y los certificados sean exactos. *(Justificación del responsable.)* | FR-011 (nuevo), US1-8 (nuevo), Edge Cases | Yangfeng Liu (respuesta directa, 2026-11-04) |
| (005-P2) | Efecto en esta spec de la decisión de spec-005 sobre las reservas no presentadas | FR-009 se matiza: desde inicio + 10 min las reservas no presentadas dejan de contar | Decidida en spec-005 (dueña de la reserva); aquí se refleja para que las dos specs describan la misma regla. | FR-009, P3 (anotación), US1-9 (nuevo) | Yangfeng Liu (respuesta directa, 2026-11-04) |

## Criterios en formato Dado… Cuando… Entonces…

- **P4**: *Dado* asistencia en «A» (10:00–11:00), *cuando* se escanea en «B» (10:30–11:30), *entonces* «Rechazado: ya registrado en «A» a esta hora» sin asistencia ni aforo consumido; *cuando* se escanea en «C» (11:00–12:00), *entonces* «Admitido».
- **FR-009 matizada**: *Dado* una sesión de las 10:00 sin plazas sin reservar y asistencias < aforo, *cuando* a las 10:10 llega alguien sin reserva, *entonces* «Admitido»; a las 10:09, «No quedan plazas sin reservar».

## Cobertura

Checklist 17/17 → 17/17. Conflictos / asistencia real: **Resolved** (P4). Dependencia con HU-05: **Resolved** (FR-009 matizada). Ventana, permisos y concurrencia: Clear. Marcadores: 0.

## Siguiente paso

Antes de tocar código (§5.1): revisar `plan.md` y las tareas añadidas en `tasks.md`; después `/speckit-analyze` (analyze-3), `/speckit-implement` con la prueba primero y `/speckit-converge`. Seguimiento en [#7](https://github.com/onewhitethreee/iw-p1/issues/7) y [#8](https://github.com/onewhitethreee/iw-p1/issues/8).
