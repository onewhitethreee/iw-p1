# Demo en vídeo de las historias de usuario

Abre **`index.html`** en el navegador (doble clic; no necesita servidor). Desde ahí se reproduce:

- el **vídeo completo** (`videos/demo-completa.mp4`, con capítulos incrustados), o
- **cada historia por separado** (`videos/hu00.mp4` … `videos/hu08.mp4`),

y se salta a cualquier escenario de aceptación desde la lista lateral. También se puede enlazar uno
directamente: `index.html#hu03/US1-2`.

| Vídeo | Contenido |
|-------|-----------|
| hu00 | Base común (000-core): portada, registro, inicio de sesión, roles |
| hu01 … hu08 | Una por historia, con todos los escenarios de su `spec.md` |

Cada escenario lleva un rótulo con su identificador de la especificación (p. ej. `US2-3`). Los casos que
solo se pueden comprobar saltándose la interfaz se muestran con una **petición directa al servidor**
(consola oscura en el vídeo). Cuando hizo falta preparar un dato que el seed no trae (p. ej. un plazo de
envío que aún no ha abierto), aparece una banda amarilla «Dato preparado en BD».

## Volver a grabar

Requisitos: la app funcionando con la BD de desarrollo (ver el README principal), `ffmpeg` y `ffprobe`
en el PATH y Chromium de Playwright.

```bash
cd apps/web
pnpm build
AUTH_URL=http://localhost:3200 pnpm exec next start -p 3200   # en otra terminal
pnpm exec tsx demo/grabar.ts            # todas (≈ 30 min); o solo algunas: … grabar.ts hu03 hu05
pnpm exec tsx demo/montar.ts            # MP4, vídeo completo, miniaturas y demo/datos.js
```


- Cada historia **recarga el seed** antes de grabarse, así que los vídeos son independientes.
- `DEMO_RAPIDO=1` ensaya el guion sin pausas (≈ 3 min en total); `DEMO_LOG=1` imprime los textos
  comprobados; `DEMO_VER=1` muestra el navegador mientras graba.
- Los guiones están en `apps/web/demo/historias/huXX.ts`.
