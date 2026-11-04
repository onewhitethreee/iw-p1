# Verificación de spec-006 (quickstart) · iteración 1

- **Fecha**: 2026-11-03 · **Rama**: `spec-006` · **Responsable**: Yangfeng Liu · **Datos**: seed de 000-core (recargado en e2e)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 1 | US1-1 admitido | e2e (asistente3 en «Aprendizaje basado en proyectos…») + integración (a) | «Admitido · Asistente 3», ocupación 1/200 → 2/200; `Asistencia.registradaPorId` = personal | Igual | ✔ |
| 2 | US1-5 ya registrado | e2e (mismo código con espacios) + integración (e), también con la sala llena | «Ya registrado» (ámbar), sin +1 | Igual | ✔ |
| 3 | US1-2 aforo completo | e2e («Rúbricas compartidas…», 2/2) + integración (b) | «Rechazado · Aforo completo», sin asistencia | Igual | ✔ |
| 4 | US1-3 código inventado | e2e + integración (c) | «Acreditación no válida» | Igual | ✔ |
| 5 | US1-4 no confirmada / otro congreso | integración (d) | «Inscripción no confirmada» / «Acreditación de otro congreso» | Igual | ✔ |
| 6 | US1-6 sin rol | e2e (asistente1 → «Acceso denegado») + integración (f): FORBIDDEN en los 3 procedimientos | Denegado | Igual | ✔ |
| 7 | FR-010 ventana | integración (g): 31 min antes / 30 min antes / en el fin | «…se abre a las 09:30» / admitido / «La sesión ya ha terminado» | Igual | ✔ |
| 8 | FR-009 / clarify P3 | integración (h) y (h2) | Sin reserva entra si quedan plazas sin reservar; si no, «No quedan plazas sin reservar»; quien reservó entra | Igual | ✔ |
| 9 | SC-002 concurrencia | integración (i): 10 escaneos simultáneos desde 2 puertas con 1 plaza; (i2) mismo código en 2 puertas | 1 admitido / 1 admitido + 1 «ya registrado» | Igual | ✔ |
| 10 | US2-1 ocupación | integración (ocupacion): admisiones desde otra puerta; pantalla con `refetchInterval` 3 s | 0/100 → 2/100 | Igual | ✔ |

**SC-001 (< 1 s)**: la integración (a) mide la llamada `escanear` completa (bloqueo + comprobaciones + alta): muy por debajo de 1 s (aserción `< 1000 ms`); en e2e el resultado aparece en la pantalla sin espera apreciable.

**SC-003 (100 % rechazadas)**: integración (c) y (d), más el e2e del código inventado.

**Notas de implementación**

- El orden de comprobación sigue el plan R2. El aforo de la sala (`asistencias < aforo`, FR-003) se comprueba para todos antes de la regla de plazas sin reservar (FR-009); así, con la sala llena el motivo es «Aforo completo» también para quien no reservó (quickstart 3). Se ha precisado en `plan.md` (decisión 2).
- En el seed una inscripción pendiente no tiene código (se genera al confirmar, 000-core); el escenario 5 del quickstart se comprueba solo por integración, donde la regla se mantiene en el servidor como defensa.
- La cámara se activa con «Escanear con la cámara» (no se pide permiso al abrir la página); el campo manual está siempre visible (US1-7). Tras cada lectura se ignoran las siguientes durante 2 s.

## Iteración 2 (converge T010)

| # | Escenario | Cómo se comprobó | Esperado | Observado | Resultado |
|---|-----------|------------------|----------|-----------|-----------|
| 11 | Edge «Sin conexión» | e2e: `/api/trpc` cortado con `page.route` | «Sin conexión: no se puede validar…» (no «Failed to fetch»); «Ocupación sin actualizar» hasta que vuelve la red | Igual | ✔ |

**Regresión**: dominio 34/34 · integración 38/38 (000-core 22 + spec-006 16) · e2e 12/12 (000-core 7 + spec-006 5) · lint y typecheck sin errores · `next build` correcto.

## Iteración tras clarify-3 (T011–T012, FR-009 matizada y FR-011) · 2026-11-05

Rama `spec-006-clarify-2`. Las pruebas (k)–(n) y el cambio de (h2) se escribieron **antes** del código y se ejecutaron sobre el código anterior.

| # | Escenario | Entrada | Esperado | Observado **antes** | Observado **después** | Resultado |
|---|-----------|---------|----------|---------------------|-----------------------|-----------|
| 12 | FR-009 matizada / (k) | aforo 2, 2 reservas sin presentarse; sin reserva a +9 y +10 min; quien reservó a +11 y +12 | +9 «No quedan plazas sin reservar»; +10 admitido; +11 admitido; +12 «Aforo completo»; 2 reservas siguen en la agenda | ✘ a +10 seguía «No quedan plazas sin reservar» | Igual que lo esperado | ✔ |
| 13 | US1-8 / FR-011 / (l) | admitido en «grande» (0–60) → «pequeña» (0–60) → sesión contigua (60–120) a +55 | «Ya registrado en «En sala grande» a esta hora», 0/1; la contigua se admite | ✘ admitido en las dos | Igual que lo esperado | ✔ |
| 14 | FR-011 concurrente / (m) ×5 | mismo código a la vez en «grande» y «doble» | 1 admitido + 1 rechazado; 1 asistencia | ✘ 2 asistencias | Igual que lo esperado | ✔ |
| 15 | analyze-3 A3 / (n) ×5 | `agenda.anadir` ∥ `escanear` de la misma persona y sesión a −20 min | Las dos terminan | ✘ **`40P01 deadlock detected`**: el defecto **ya existía** en `main`. `escanear` bloqueaba la sesión y, al insertar la `Asistencia`, la clave ajena pedía un bloqueo `KEY SHARE` sobre la `Inscripcion` que `anadir` ya tenía; `anadir` esperaba la sesión | Las dos terminan (orden inscripción → sesión) | ✔ |

Comando del «antes»: `pnpm exec vitest run tests/integration/006` → **4 failed | 16 passed**. Después: **20/20**.

**Regresión**: dominio 43/43 · integración **182/182** · lint, typecheck y `next build` ✔ · e2e **44 passed, 1 failed, 3 sin ejecutar**. El fallo es `006-acceso.spec.ts` US1-2: escanea en «Rúbricas compartidas…» a `asistente3`, que la prueba anterior acaba de admitir en «Aprendizaje basado en proyectos…», a la misma hora. Ahora responde «Ya registrado en … a esta hora», que es lo que pide FR-011. Se trata en converge-2 (F1), junto con el seed (F2).

### Iteración 3 (converge-2 → T013) · 2026-11-05

| # | Escenario | Esperado | Observado antes | Observado después | Resultado |
|---|-----------|----------|-----------------|-------------------|-----------|
| 16 | e2e US1-2 «Aforo completo» con `demo02` | «Rechazado · Aforo completo», 2 / 2 | ✘ con `asistente3`: «Ya registrado en … a esta hora» | Igual que lo esperado | ✔ |
| 17 | Seed sin asistencias solapadas | Auditorio 1/200 (`demo01`), Aula 3 2/2 | ✘ `asistente1` en dos sesiones a la vez | Igual que lo esperado; e2e US1-1 sigue viendo «1 / 200» | ✔ |

**Regresión final**: dominio 43/43 · integración 182/182 · e2e **48/48** · lint y typecheck ✔.

