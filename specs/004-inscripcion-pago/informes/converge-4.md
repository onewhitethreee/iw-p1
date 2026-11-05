# Informe `/speckit-converge` · spec-004 · iteración 4 (al regrabar la demo)

- **Fecha**: 2026-11-05 · **Herramienta**: Spec Kit `1.2.4.dev0` · **Rama**: `spec-004-converge-4` · **Base**: `50c56e8` (`main`)
- **Origen**: al ensayar la demo de HU-04 (`DEMO_RAPIDO=1`), el guion se quedó esperando la tarjeta «Pendiente de pago · Profesional» después de volver a inscribirse.
- **Resultado**: `tasks_appended` · 1 tarea (T017)

| ID | Tipo | Gravedad | Origen | Evidencia | Tarea |
|----|------|----------|--------|-----------|-------|
| F1 | contradicts (interfaz) | HIGH | US2-1 («ve su QR»), US2-5, US2-6 | Tras `crear` o `pagar`, la interfaz navegaba con `router.push` **sin** `router.refresh()`. La caché del router de Next en el cliente seguía sirviendo la versión anterior de `/area-personal` al volver con el enlace «Área personal». (1) Tras pagar, la tarjeta seguía «Pendiente de pago · Pagar 90,00 €»: **defecto presente en `main` desde la primera entrega**. (2) Tras cancelar y volver a inscribirse, seguía «Cancelada». Al recargar, el estado era el correcto: el servidor siempre estuvo bien. Las pruebas e2e no lo veían porque entraban al área personal con `page.goto`, que es una carga completa. | T017 |

Métricas: missing 0 / partial 0 / contradicts 1 (interfaz) / unrequested 0 · HIGH 1.
