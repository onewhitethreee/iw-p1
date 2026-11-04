# Informe `/speckit-clarify` · spec-001 (HU-01 Enviar propuesta) · iteración 2 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-001-clarify-2` · **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-2.md`](spec-antes-clarify-2.md) · diferencia: [`clarify-2.diff`](clarify-2.diff)
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
| Recorrido habitual | US1-1 enviar y ver «Enviada» | e2e `001-enviar-propuesta` US1-1 | ✔ |
| Entrada inválida | US1-4 resumen demasiado corto | e2e US1-4 + `integration/001/enviar.test.ts` | ✔ |
| Permisos | US1-6 asistente → «Acceso denegado»; sin sesión → entrar | e2e US1-6 | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P4 | ¿Qué hace el sistema si el mismo ponente envía al mismo congreso una propuesta con el mismo título que otra suya? | La rechaza; se compara el título sin mayúsculas ni espacios extremos | Al revisar US1-1 sobre la versión funcional, `propuesta.enviar` no tiene ninguna regla de unicidad: un doble clic o un reintento de red crea dos propuestas iguales, y el comité tendría que asignarlas y evaluarlas dos veces. La narrativa quiere «seleccionar las mejores ponencias», no evaluar copias. No limita el número de propuestas distintas (se mantiene P2). | FR-009, FR-011 (nuevo), US1-7 (nuevo), Edge Cases | Yangfeng Liu (respuesta directa, 2026-11-04) |

## Criterios en formato Dado… Cuando… Entonces…

- **P4**: *Dado* un ponente con la propuesta «Título A» en el congreso X, *cuando* envía « título a » a X, *entonces* se rechaza con «Ya has enviado una propuesta con este título a este congreso» y sigue habiendo una sola; *cuando* envía «Título A» al congreso Y, *entonces* se acepta.

## Cobertura

Checklist 17/17 → 17/17. Casos límite / conflictos: **Resolved** (P4). Alcance, roles, datos y estados: Clear. Marcadores: 0.

## Siguiente paso

Antes de tocar código (§5.1): revisar `plan.md` y las tareas añadidas en `tasks.md`; después `/speckit-analyze` (analyze-3), `/speckit-implement` con la prueba primero y `/speckit-converge`. Seguimiento en [#5](https://github.com/onewhitethreee/iw-p1/issues/5).
