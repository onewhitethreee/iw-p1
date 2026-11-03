# Verificación de spec-005 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-005` · **Datos**: seed de 000-core (recargado en e2e)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 añadir | e2e (asistente3, «Gamificación…») + integración (a) | En la agenda; plazas −1 | Igual | ✔ |
| 2 | US1-2 solape | e2e + integración (b) | «Se solapa con «…» de HH:mm a HH:mm» | Igual | ✔ |
| 3 | US1-4 completa | integración (d) | «Aforo completo», `completa` | Igual | ✔ |
| 4 | US1-6 sin confirmar | e2e (asistente4) + integración (f) | Sin agenda / FORBIDDEN | Igual | ✔ |
| 5 | US2-2 quitar | e2e + integración (b) | Desaparece y libera plaza | Igual | ✔ |
| 6 | US2-3 empezada | integración quitar (c); e2e «Ya empezada» | CONFLICT / sin «Añadir» | Igual | ✔ |
| 7 | SC-002 | integración añadir (e): 20 simultáneos por 1 plaza | 1 aceptado | 1 | ✔ |
| — | FR-009 / P1 aviso de solapes | integración quitar (e) | `solapaCon` en ambas, sin quitarlas | Igual | ✔ |
| — | Concurrencia misma persona | integración añadir (i) | 1 de 2 solapadas | 1 | ✔ |

**SC-003 (un clic)**: botón «Añadir» por sesión en la sección «Programa» de la agenda (comprobado en e2e).

**Regresión**: dominio 38/38 · integración 37/37 (000-core 22 + spec-005 15) · e2e 10/10 (000-core 7 + spec-005 3) · lint y typecheck sin errores.
