# Verificación de 000-core (quickstart) · base común

- **Fecha**: 2026-11-04 · **Rama**: `main` (8 historias integradas) · **Responsable**: Yangfeng Liu · **Datos**: seed de 000-core (recargado en e2e)

| # | Escenario del quickstart | Cómo se comprobó | Esperado | Observado | Resultado |
|---|--------------------------|------------------|----------|-----------|-----------|
| 1 | Pruebas de la base | `pnpm --filter @congresalia/domain test` y `vitest run tests/integration/core` | En verde | 42/42 dominio (34 de la base y el resto de las historias) · 22/22 integración de core (auth, congreso, invariantes CHECK, rol propio, roles) | ✔ |
| 2 | US2: portada sin sesión | e2e `core.spec.ts` «la portada muestra los congresos del seed» | Los tres congresos con su fase | Igual | ✔ |
| 2b | US2-2: congreso inexistente | e2e `core.spec.ts` (analyze D1) | «Página no encontrada» | Igual | ✔ |
| 2c | US2-3: fases y plazo en días (FR-005a) | e2e `core.spec.ts` | Fase y plazo mostrados como días completos | Igual | ✔ |
| 3 | US1: registro y acceso denegado a organización | e2e `core.spec.ts` | Sesión iniciada; «Acceso denegado» en `/organizador` | Igual | ✔ |
| 3b | US1-2: correo repetido / credenciales incorrectas | e2e `core.spec.ts` + `integration/core/auth.test.ts` | Mensaje de error, sin cuenta duplicada | Igual | ✔ |
| 3c | US1: zona privada sin sesión | e2e `core.spec.ts` | Lleva a «Entrar» y vuelve tras iniciar sesión | Igual | ✔ |
| 3d | US1-5/6: añadirse el rol ponente (clarify P2, FR-003a) | e2e `core.spec.ts` + `integration/core/rol-propio.test.ts` | Se añade PONENTE; no se puede autoasignar COMITE/ORGANIZADOR/ACREDITACION | Igual | ✔ |
| 4 | SC-001: roles en el servidor | `integration/core/roles.test.ts` (`createCaller`) | UNAUTHORIZED sin sesión, FORBIDDEN con un rol insuficiente | Igual | ✔ |

**e2e de la base**: 7/7 en `tests/e2e/core.spec.ts`.

Las tareas de convergencia de 000-core (T042–T044: errores en español, restricciones CHECK y quickstart) están cubiertas por
las filas 1 y 3b (`invariantes.test.ts` y mensajes de error). La regresión completa con las 8 historias está en
[docs/verificacion-integrada.md](../../../docs/verificacion-integrada.md).
