# Informe `/speckit-clarify` · spec-008 (HU-08 Panel en tiempo real) · iteración 2 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-008-clarify-2` · **Spec**: [`spec.md`](../spec.md) · sin cambios en `spec.md`
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
| Recorrido habitual | US1-1/US1-2 cifras, desglose y refresco sin recargar; US3-2 cambiar a sala mayor | e2e `008-panel` US1-1 y US3-2 + RC-2 | ✔ |
| Caso límite / error | US3-1 sin salas libres; conexión cortada → últimos datos y aviso | e2e US2-1/US3-1 y «conexión falla» | ✔ |
| Permisos | US1-3 un asistente no abre el panel | e2e US1-3 | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
_Ninguna pregunta: no se han encontrado ambigüedades que cambien la implementación o las pruebas (no se inventan problemas, §5.1)._

## Criterios en formato Dado… Cuando… Entonces…

No hay criterios nuevos. **Criterios que se mantienen y por qué**:

- *«Tiempo real» = sondeo cada 5 s* (A9): basta para «tomar decisiones sobre la marcha» como cambiar de sala. En e2e se ve la actualización sin recargar. Una conexión permanente (WebSocket) no cambiaría ninguna decisión del organizador.
- *Inscripciones confirmadas y pendientes por separado; ingresos solo de pagos aprobados* (FR-002): es inequívoco. La cancelación de pendientes (spec-004 P4) solo saca las `CANCELADA` del recuento de pendientes, que se revisará con la tarea T014 de spec-004.
- *Ocupación = máx(reservas, asistencias) / aforo* (P1): sigue siendo válida con spec-005 P2, porque las reservas no presentadas siguen en la agenda y la ocupación no puede pasar del aforo.

## Cobertura

Checklist 17/17 → 17/17 (sin cambios). Todas las categorías: Clear. Marcadores: 0.

## Siguiente paso

Sin cambios de código. Seguimiento en este PR (sin tareas nuevas).
