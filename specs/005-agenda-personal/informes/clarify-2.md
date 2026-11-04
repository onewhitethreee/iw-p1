# Informe `/speckit-clarify` · spec-005 (HU-05 Agenda personal) · iteración 2 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-005-clarify-2` · **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-2.md`](spec-antes-clarify-2.md) · diferencia: [`clarify-2.diff`](clarify-2.diff)
- **Responsable**: Yangfeng Liu · **Revisión**: autorrevisión diferida (grupo de una persona)
- **Instrucción**: «Revisa las ambigüedades de la historia sobre la aplicación ya funcionando, especialmente quién puede realizar cada acción, qué datos son válidos y qué ocurre ante estados incompatibles. Formula las preguntas necesarias para concretar criterios de aceptación verificables.»
- **Diferencia con la iteración 1**: aquella se hizo antes de implementar. Esta se hace sobre la versión funcional, como pide el §5.1, y **cada respuesta la ha elegido el responsable** (no se acepta la recomendación por delegación).

## Prueba de la versión funcional (paso 1 de §5.1)

- **Commit de referencia**: `7e59b84` (`main`, 2026-11-04) · **Herramienta**: Spec Kit `1.2.4.dev0` (skill `speckit-clarify`)
- **Suite ejecutada antes de clarify**: dominio 42/42 · integración 166/166 · e2e **46/46** (`E2E_PORT=3300 pnpm test:e2e`, seed recargado) · lint y typecheck sin errores.
- *Nota*: la primera ejecución del e2e dio 8 fallos de inicio de sesión. La causa era que Playwright reutilizó un `next start` antiguo que seguía en el puerto 3100 (`reuseExistingServer`). Con un servidor limpio, todo en verde. No es un defecto de la aplicación ([#10](https://github.com/onewhitethreee/iw-p1/issues/10)).

## Tres situaciones revisadas

| Situación | Escenario | Evidencia en la versión funcional | Resultado |
|-----------|-----------|-----------------------------------|-----------|
| Recorrido habitual | US1-1 añadir; US2-2 quitar | e2e `005-agenda` US1-1/US1-2/US2-2 | ✔ |
| Caso límite | US1-2 solape rechazado; US1-5 20 peticiones por la última plaza → 1 | e2e US1-2 + `integration/005/anadir.test.ts` | ✔ |
| Estado / permisos | Sesión empezada sin «Añadir»; US1-6 inscripción pendiente sin agenda | e2e «Estados» y US1-6 | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P2 | Si quien reservó no se presenta, ¿hasta cuándo se le guarda la plaza? | Hasta 10 min después del inicio; después queda libre, y la sesión sigue en su agenda | Liberar a los 10 minutos las plazas de quien no ha escaneado aprovecha al máximo los asientos que de verdad quedan libres y, a la vez, quien llega tarde puede seguir entrando si hay sitio. *(Justificación del responsable.)* | FR-010 (nuevo), US1-8 (nuevo), Edge Cases, Assumptions; **spec-006 FR-009** | Yangfeng Liu (respuesta directa, 2026-11-04) |

## Criterios en formato Dado… Cuando… Entonces…

- **P2**: *Dado* una sesión de 10:00 con aforo 40, 40 reservas y 30 entradas, *cuando* a las 10:10 llega alguien sin reserva, *entonces* entra; *cuando* llega a las 10:09, *entonces* «No quedan plazas sin reservar». *Dado* quien reservó y llega a las 10:20 con la sala llena, *entonces* «Aforo completo», y la sesión sigue en su agenda.

## Cobertura

Checklist 17/17 → 17/17. Dependencias entre historias (HU-05 ↔ HU-06): **Resolved** (P2). Solapes, aforo y permisos: Clear. Marcadores: 0.

## Siguiente paso

Antes de tocar código (§5.1): revisar `plan.md` y las tareas añadidas en `tasks.md`; después `/speckit-analyze` (analyze-3), `/speckit-implement` con la prueba primero y `/speckit-converge`. Seguimiento en [#7](https://github.com/onewhitethreee/iw-p1/issues/7). La regla se aplica en el escaneo de spec-006 (T011); aquí solo se define.
