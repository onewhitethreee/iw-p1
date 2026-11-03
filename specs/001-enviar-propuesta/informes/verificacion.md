# Verificación de spec-001 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-001` · **Código**: commit `d2cda0e` + cambios de implement (ver commit siguiente)
- **Datos**: seed de 000-core (`pnpm db:seed`), congreso `jornadas-pediatria-2027` con llamada abierta
- **Ejecutado por**: pruebas automáticas (Vitest + Playwright); el responsable revisa este registro

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 envío válido | e2e «US1-1» | «Propuesta enviada» y fila «Enviada» | Igual | ✔ |
| 2 | US1-4 resumen corto | e2e «US1-4» + integración (d) | Error en el campo, no se guarda | «El resumen debe tener entre 100 y 3000 caracteres»; 0 filas | ✔ |
| 3 | US1-6 permisos | e2e «US1-6» + integración (f) | Asistente: acceso denegado; anónimo: a /entrar | Igual; API: FORBIDDEN / UNAUTHORIZED | ✔ |
| 4 | US1-2 plazo cerrado | integración (b), `ahora` = 00:00 del 16/02/2027 (Madrid) | CONFLICT «…está cerrado» | Igual, 0 filas nuevas | ✔ |
| 5 | FR-005a último día | integración (b), `ahora` = 23:59 del 15/02/2027 | Aceptada | Aceptada | ✔ |
| 6 | US2-1/2 lista propia | e2e «US2-1/US2-2» + integración (a)(b) | Solo propias, más reciente primero | Igual | ✔ |
| 7 | US2-5 lista vacía | e2e «US2-5» | «Todavía no has enviado ninguna propuesta.» | Igual | ✔ |
| 8 | US2-3 privacidad | integración mias (c) | Sin puntuaciones, comentarios ni evaluadores | Claves exactas `area, congreso, enviadaEn, estado, id, resumen, titulo` | ✔ |
| — | US1-3 antes de apertura | integración (c) | «…se abre el 10 de enero de 2027» | Igual | ✔ |
| — | US1-5 área de otro congreso | integración (e) | BAD_REQUEST | Igual | ✔ |
| — | FR-008/P1 inmutable | integración (i) | Solo `enviar` y `mias` | Igual | ✔ |
| — | FR-009/P2 sin límite | integración (h) | 4 propuestas aceptadas | 4 | ✔ |

## SC-001 (formulario completo en menos de 3 minutos)

El formulario tiene 4 campos y el recorrido e2e completo (entrar, abrir formulario, rellenar y enviar) tarda unos 2,4 s.
La medición con una persona real queda **pendiente de realizar por el responsable** durante la grabación de la demo;
el diseño (selectores con valores del congreso, contador de caracteres, errores por campo) no introduce pasos adicionales.

## Regresión

dominio 34/34 · integración 36/36 (000-core 22 + spec-001 14) · e2e 12/12 (000-core 7 + spec-001 5) · lint y typecheck sin errores.
