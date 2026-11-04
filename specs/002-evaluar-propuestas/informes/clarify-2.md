# Informe `/speckit-clarify` · spec-002 (HU-02 Evaluar propuestas) · iteración 2 (sobre la versión funcional)

- **Fecha**: 2026-11-04 · **Rama**: `spec-002-clarify-2` · **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-2.md`](spec-antes-clarify-2.md) · diferencia: [`clarify-2.diff`](clarify-2.diff)
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
| Recorrido habitual | US1-1/US1-2 evaluar sin ver al autor | e2e `002-evaluar-propuestas` US1-1/US1-2 + `integration/002/anonimato.test.ts` | ✔ |
| Caso límite / estado | US3-2 aceptar con menos de 2 evaluaciones; US1-6 evaluar una decidida | e2e US3-2 y US1-6 + `integration/002/decidir.test.ts` | ✔ |
| Permisos | Un asistente no entra en la zona del comité | e2e «Permisos» | ✔ |

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P3 | ¿Debe el sistema impedir asignar una propuesta a un miembro del comité de otra área? | No: se **mantiene** el criterio actual y se hace explícito (FR-012) | La frase «formado por expertos del área» describe al comité en conjunto (el área del congreso: salud, educación), no a cada miembro. La narrativa no pide registrar especialidades, y la asignación ya es manual: quien conoce a los expertos es el organizador. Restringirla exigiría una relación evaluador–área en el modelo de 000-core, sin que la narrativa lo pida (Constitución II). | Assumptions → decisión, FR-012 (nuevo) | Yangfeng Liu (respuesta directa, 2026-11-04) |

## Criterios en formato Dado… Cuando… Entonces…

- **P3**: *Dado* una propuesta del área «Pediatría» y un miembro del comité que nunca ha evaluado esa área, *cuando* el organizador se la asigna, *entonces* la asignación se acepta (solo se rechaza si es el autor o ya estaba asignado, FR-002).

## Cobertura

Checklist 17/17 → 17/17. Alcance y roles: **Resolved** (P3, se mantiene el criterio). Anonimato, datos y estados: Clear. Marcadores: 0.

## Siguiente paso

Sin cambios de código. Seguimiento en este PR (no hacen falta tareas: el comportamiento actual ya cumple FR-012 y se mantiene).
