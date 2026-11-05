
# Informe `/speckit-clarify` · spec-001 (HU-01) · iteración 3 (tras la medición con personas)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Spec**: [`spec.md`](../spec.md) · previa: [`spec-antes-clarify-3.md`](spec-antes-clarify-3.md) · diferencia: [`clarify-3.diff`](clarify-3.diff)
- **Responsable**: Yangfeng Liu · **Origen**: la medición de SC-001 (issue #1) dio 1 de 3 por encima de 3 min. La memoria ya preveía volver a clarify si fallaba, porque SC-001 no decía si el resumen se trae redactado.

## Datos que motivan la pregunta

| Persona | Resumen | Tiempo | < 3 min |
|---------|---------|--------|---------|
| A | pegado | 1 min 35 s | ✔ |
| B | tecleado | 2 min 48 s | ✔ |
| C | tecleado | 3 min 22 s | ✘ |

El tiempo de más está en mecanografiar el resumen (100–3000 caracteres), no en la interfaz. La estimación KLM de la interfaz sin teclear el resumen es de unos 25 s.

## Registro de decisiones

| # | Pregunta | Respuesta | Justificación | Criterios afectados | Decidido por |
|---|----------|-----------|---------------|---------------------|--------------|
| P5 | ¿El tiempo de SC-001 incluye escribir el resumen? | No: se mide con el resumen ya redactado (pegado) | Escribir el resumen es trabajo del ponente, no de la aplicación; un criterio de éxito del sistema debe medir lo que depende del sistema. *(Opción elegida por el responsable; revisar la redacción con sus palabras.)* | SC-001 | Yangfeng Liu (2026-11-05) |

**No es rebajar el criterio**: el límite de 3 min y lo que se pide hacer en ese tiempo no cambian. Se precisa una condición que faltaba. Por eso, las mediciones de B y C (tecleando) **no cuentan** como mediciones de SC-001 y se repetirán pegando el resumen.

## Criterio en formato Dado… Cuando… Entonces…

- *Dado* un ponente con el resumen ya redactado, *cuando* abre el formulario, lo rellena pegando el resumen y lo envía, *entonces* ve «Propuesta enviada» en menos de 3 minutos.
