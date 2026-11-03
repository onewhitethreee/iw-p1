# Research: Panel en tiempo real (spec-008)

- **R1 Refresco** — Decisión: sondeo cada 5 s con TanStack Query. Motivo: A9 y Constitución I; un resumen agregado es barato. Alternativas: SSE/WebSockets (infraestructura adicional sin necesidad).
- **R2 Agregación** — Decisión: `groupBy`/`_count` de Prisma y una consulta SQL para los ingresos por tipo × tarifa. Motivo: SC-004 (1.000 inscripciones, 50 sesiones < 2 s) y SC-002 (exactitud al céntimo con enteros). Alternativa: cargar todas las filas y sumar en JS (más lento y más memoria).
- **R3 Ocupación** — Decisión: máx(reservas, asistencias) / aforo (P1), en `packages/domain`. Motivo: antes de empezar importan las reservas y durante la sesión las asistencias; regla pura y probada.
- **R4 Cambio de sala** — Decisión: procedimiento propio `panel.cambiarSala` con las reglas de spec-003 aplicables a un cambio de sala. Motivo: las ramas parten de `main`; depender de `programa.mover` (rama spec-003) impediría probar spec-008 por separado. Alternativa: copiar el router de spec-003 (duplicaría todo el programa).
- **R5 Concurrencia al mover** — Decisión: bloqueo `FOR UPDATE` de la sala destino y de la sesión. Motivo: dos cambios a la misma sala a la vez no pueden pasar ambos el control de solape (US3-3).
- **R6 Filtro** — Decisión: en el cliente. Motivo: ≤ 50 sesiones; evita otra consulta.
