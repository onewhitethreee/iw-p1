# Estimación KLM de los criterios de tiempo con usuario real

- **Fecha**: 2026-11-04 · **Código**: `main` en `98db582` (aplicación sin cambios) · **Responsable**: Yangfeng Liu · **Revisor**: autorrevisión diferida
- **Script reproducible**: [`apps/web/tests/klm/estimar-klm.ts`](../../../apps/web/tests/klm/estimar-klm.ts)
- **Criterios**: spec-001 SC-001 (T015), spec-002 SC-003 (T020), spec-003 SC-004 (T022), spec-004 SC-001 (T013)

> **Esto es una estimación, no una medición con personas.** Las cuatro tareas de converge siguen **abiertas**
> hasta que una persona real las cronometre. La estimación sirve para saber, antes de esa medición, si el
> diseño de cada pantalla permite cumplir el objetivo y dónde está el riesgo.

## Método

*Keystroke-Level Model* (Card, Moran y Newell, 1983). El tiempo de un usuario experto que no comete errores es
la suma de los operadores de cada acción:

| Operador | Significado | Perfil medio | Perfil lento |
|----------|-------------|--------------|--------------|
| K | Pulsar una tecla | 0,28 s (mecanógrafo medio, 40 ppm) | 1,2 s («peor mecanógrafo» de la tabla original) |
| P | Apuntar con el ratón | 1,1 s | 1,1 s |
| B | Pulsar o soltar el botón del ratón (un clic = 2 B) | 0,1 s | 0,1 s |
| H | Mover la mano entre ratón y teclado | 0,4 s | 0,4 s |
| M | Preparación mental antes de cada paso | 1,35 s | 1,35 s |
| R | Espera del sistema | **medida** con Playwright | **medida** |

Además, en HU-02 se suma el tiempo de **leer la propuesta**: todas las palabras de la página de evaluación,
incluidas las etiquetas del formulario, a 200 palabras/min. Es una cifra conservadora: la media de lectura
silenciosa es ~238 palabras/min (Brysbaert, 2019).

**Cómo se obtienen los recuentos.** Playwright ejecuta cada flujo en la aplicación real (`next start`, seed
recién cargado), desde la página de partida hasta el resultado final, y teclea carácter a carácter. Cada
acción registra sus operadores: un desplegable cuenta 2 × (P + BB), es decir, abrir y elegir. Cada paso lleva
un M. Cada cambio entre ratón y teclado suma un H. La sesión ya está iniciada al empezar, como en la
redacción de los criterios.

Reglas para no favorecer el resultado:
- HU-01 empieza en `/ponente` y HU-04 en la ficha del congreso, es decir, **un clic antes** de la página que
  indican T015 y T013.
- El resumen de HU-01 se calcula de dos formas: **tecleado** y **pegado**. Un resumen para una llamada a
  comunicaciones suele estar ya escrito, pero no se da por supuesto.

## Resultados

| Tarea | Criterio | K | P | B | H | M | R medido (s) | Lectura (s) | Medio (s) | Lento (s) | Límite | ¿Cumple? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| spec-001 T015 (a) | Enviar propuesta, resumen **tecleado** (27 + 152 car.) | 179 | 8 | 16 | 4 | 6 | 0,2 | — | 70,4 | **235,1** | < 180 s | Medio ✔ · lento **✘** |
| spec-001 T015 (b) | Enviar propuesta, resumen **pegado** | 29 | 8 | 16 | 4 | 6 | 0,2 | — | 28,4 | 55,1 | < 180 s | ✔ |
| spec-002 T020 | Evaluar una propuesta asignada (99 palabras) | 57 | 5 | 10 | 2 | 4 | 0,3 | 29,7 | 58,7 | 111,1 | < 120 s | ✔ (lento con poco margen) |
| spec-003 T022 | Programar una ponencia aceptada | 8 | 5 | 10 | 4 | 4 | 0,1 | — | 15,9 | 23,2 | < 60 s | ✔ |
| spec-004 T013 | Inscribirse y pagar (16 dígitos) | 16 | 6 | 12 | 2 | 5 | 0,3 | — | 20,2 | 34,9 | < 180 s | ✔ |

Salida completa del script (pasos de cada flujo): se reproduce con
`pnpm db:seed && pnpm --filter web exec tsx tests/klm/estimar-klm.ts` y `next start -p 3100` en marcha.

## Interpretación

- **HU-03 y HU-04** cumplen con mucho margen incluso con el perfil lento. El formulario de programar solo pide
  sala y dos horas, y el pago solo el número de tarjeta.
- **HU-02** cumple, pero con el perfil lento queda a 9 s del límite. Casi todo el tiempo es **leer** la
  propuesta y **escribir** los comentarios, que son el objetivo de la tarea y no un coste de la interfaz. Con
  un resumen más largo (el máximo es de 3000 caracteres) el criterio dependería sobre todo de la lectura. Hay
  que tenerlo en cuenta al hacer la medición real.
- **HU-01 es el riesgo**. Con el resumen tecleado, el perfil medio cumple (70 s) pero el lento no (235 s). El
  tiempo de la interfaz (desplegables, título y clics) es de unos 25 s; el resto es mecanografiar el resumen.
  SC-001 no dice si el resumen se trae preparado. **No se rebaja el criterio**: se deja anotado para que la
  medición real indique cómo se hizo, y la duda pasa a ser candidata a una pregunta de `clarify` si la
  medición falla.
- **R** (la espera del sistema) no llega a 0,5 s en ningún flujo: el tiempo depende de la persona, no de la
  aplicación.

## Límites de la estimación

- KLM supone un usuario **experto y sin errores**. No incluye aprender la pantalla, buscar con la vista ni
  corregir. Un usuario nuevo tardará más, y por eso hace falta la medición real.
- Los valores de M y K son medias de la literatura, no de los usuarios de Congresalia.
- La lectura se aproxima por número de palabras. No mide cuánto tarda una persona en decidir la puntuación.
