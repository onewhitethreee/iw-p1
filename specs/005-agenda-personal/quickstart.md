# Quickstart: validar spec-005

Seed `congreso-innovacion-educativa-2026` (en curso, publicado): `asistente3` confirmado con agenda vacía; «Competencia digital docente» (Aula 3, aforo 2) con 1 reserva; «Gamificación…» y «Evaluación formativa…» se solapan.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 | `asistente3@` → `/area-personal/agenda` → Innovación → «Añadir» en «Gamificación…» | Aparece en «Mi agenda»; plazas libres −1 |
| 2 | US1-2 solape | «Añadir» en «Evaluación formativa…» | «Se solapa con «Gamificación…» de … a …» |
| 3 | US1-4 completa | Añadir «Competencia digital» (queda 0) y probar con otro asistente | «Aforo completo» |
| 4 | US1-6 sin confirmar | `asistente4@` (pendiente) | Sin acceso a la agenda / FORBIDDEN |
| 5 | US2-2 quitar | Quitar «Gamificación…» | Desaparece y la plaza se libera |
| 6 | US2-3 empezada | Integración: quitar una sesión empezada | CONFLICT |
| 7 | SC-002 | Integración: 20 reservas simultáneas por 1 plaza | 1 aceptada |
