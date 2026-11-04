# Informe `/speckit-clarify` · spec-004 (HU-04 Inscripción y pago) · iteración 2 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-004-clarify-2` · **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-2.md`](spec-antes-clarify-2.md) · diferencia: [`clarify-2.diff`](clarify-2.diff)
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
| Recorrido habitual | US1-1 + US2-1 inscribirse con tarifa temprana y pagar → QR | e2e `004-inscripcion` US1-1 + US2-2 + US2-1 | ✔ |
| Entrada inválida | US2-2 tarjeta 4000 0000 0000 0002 rechazada, sigue pendiente | e2e (mismo test) + `integration/004/pagar.test.ts` | ✔ |
| Estado | US1-3 ya inscrito → aviso; inscripción pendiente con el tipo equivocado | e2e US1-3. Al revisarlo se ve que una pendiente mal elegida **no tiene salida**: no se puede pagar con otro tipo, ni cancelar, ni crear otra (FR-003) | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P4 | Si el asistente se equivocó de tipo y aún no ha pagado, ¿cómo lo corrige? | Cancela la pendiente y se inscribe de nuevo; una confirmada no se cancela | Probando US1-3 se ve que la P1 de clarify-1 deja al asistente bloqueado para siempre: con el tipo equivocado no puede corregirlo ni volver a inscribirse (FR-003). La narrativa dice que «la inscripción solo se confirma cuando se ha pagado»: mientras no hay pago no hay compromiso ni dinero que devolver, así que cancelar no exige reembolsos. Se **revoca en parte** P1, pero se mantiene que el tipo de una inscripción no cambia: la tarifa se fija al crear cada inscripción (A4). | FR-003, FR-011, FR-014 (nuevo), US2-5…7, Edge Cases, Assumptions; modelo de 000-core (estado `CANCELADA`) | Yangfeng Liu (respuesta directa, 2026-11-04) |

## Criterios en formato Dado… Cuando… Entonces…

- **P4**: *Dado* una inscripción `PENDIENTE_PAGO` como estudiante, *cuando* su titular la cancela, *entonces* queda `CANCELADA` con sus intentos de pago y puede inscribirse como profesional al precio vigente ese día. *Dado* una inscripción `CONFIRMADA`, *cuando* se intenta cancelar con una petición directa, *entonces* se rechaza y la inscripción sigue confirmada.

## Cobertura

Checklist 17/17 → 17/17. Estados y transiciones: **Resolved** (P4, revisa P1). Datos, permisos y pagos: Clear. Marcadores: 0.

## Siguiente paso

Antes de tocar código (§5.1): revisar `plan.md` y las tareas añadidas en `tasks.md`; después `/speckit-analyze` (analyze-3), `/speckit-implement` con la prueba primero y `/speckit-converge`. Seguimiento en [#6](https://github.com/onewhitethreee/iw-p1/issues/6). **Cambia el modelo compartido**: según la Constitución V, el estado `CANCELADA` y el ajuste de la restricción única `(congresoId, usuarioId)` se aplican primero en `specs/000-core/data-model.md`.
