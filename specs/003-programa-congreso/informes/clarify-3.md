# Informe `/speckit-clarify` · spec-003 (HU-03 Programa del congreso) · iteración 3 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-003-clarify-2` · **Spec**: [`spec.md`](../spec.md) · sin cambios en `spec.md`
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
| Recorrido habitual | US1-1 programar; US3-1 publicar y ver el programa público | e2e `003-programa` US1-1 y US3-1 | ✔ |
| Caso límite | US1-2 solape de ponente rechazado; US1-4 sesión contigua aceptada | e2e US1-1/US1-2/US1-4 + `integration/003/programar.test.ts` | ✔ |
| Permisos / estado | US1-7 un asistente no accede; US3-2 en borrador el público no ve sesiones | e2e US1-7 y US3-2 | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
_Ninguna pregunta: no se han encontrado ambigüedades que cambien la implementación o las pruebas (no se inventan problemas, §5.1)._

## Criterios en formato Dado… Cuando… Entonces…

No hay criterios nuevos. **Criterios que se mantienen y por qué**:

- *No se despublica el programa y no se avisa a los asistentes de los cambios* (Assumptions): la narrativa solo pide «publicar» el programa; avisar por correo sería alcance nuevo (Constitución II). Los cambios ya se ven en la página pública, y la agenda avisa de los solapes que provocan (spec-005 P1).
- *Mover una sesión a una sala más pequeña*: se ha comprobado que `programa.mover` rechaza una sala con menos aforo que las reservas de la sesión (`programa.ts`, mensaje «La sala … tiene aforo …»). Es coherente con spec-008 P2, así que no hay ambigüedad entre historias.
- La decisión de spec-005 P2 (liberar las reservas a los 10 min) no cambia ninguna regla del programa.

## Cobertura

Checklist 17/17 → 17/17 (sin cambios). Todas las categorías: Clear. Marcadores: 0.

## Siguiente paso

Sin cambios de código. Seguimiento en este PR (sin tareas nuevas).
