# Registro de hallazgos `/speckit-analyze` · 000-core

Responsable: Yangfeng Liu · Revisor: autorrevisión diferida · Informe inicial: [analyze-1.md](analyze-1.md) · Informe final: [analyze-2.md](analyze-2.md)

| ID | Historia / criterio | Gravedad | Evidencia | Decisión | Responsable | Estado |
|----|---------------------|----------|-----------|----------|-------------|--------|
| D1 | 000-core US2 (Constitución III) | CRITICAL | US2 solo tenía el escenario habitual | Añadidos escenarios 2 (slug inexistente → 404) y 3 (fases); tareas T040–T041 | Yangfeng Liu | Corregido en la spec; T040–T041 pendientes de implementar |
| I1 | spec-001 FR-002 y Edge Cases; spec-004 FR-002 y escenarios 1–2 | HIGH | Redacción en «instante» tras clarify P1 (días completos) | Reescritos en días completos citando 000-core FR-005a | Yangfeng Liu | Cerrado |
| C1 | FR-011…FR-020, SC-001 | MEDIUM | Sin indicar qué spec los aplica | Tabla «Requisito → spec» en tasks.md. No se elimina ningún requisito (son válidos) | Yangfeng Liu | Cerrado |
| I2 | spec-004 escenario 6 / 000-core FR-003a | MEDIUM | Faltaba el caso «con sesión sin rol asistente» | Escenario 6 nuevo en spec-004 | Yangfeng Liu | Cerrado |
| I3 | T024 / research R11 | LOW | react-hook-form vs useActionState | R11 y T024 actualizados con la decisión real y su motivo | Yangfeng Liu | Cerrado |
| I4 | T026 / plan | LOW | `requireRol`/`guards.ts` vs `comprobarRol`/`guards.tsx` | Nombres unificados | Yangfeng Liu | Cerrado |
| I5 | T009 / T023 | LOW | `plazoEnvioAbierto` / `select` | Nombres unificados | Yangfeng Liu | Cerrado |
| I6 | contrato `congreso.porSlug` | LOW | Devuelve salas no documentadas | Contrato actualizado | Yangfeng Liu | Cerrado |
| U1 | SC-004 | LOW | Sin tarea de medición | Se acepta verificación manual: el registro e2e (T031) tarda < 2 s | Yangfeng Liu | Aceptado (justificado) |
| U2 | quickstart | LOW | Usuarios `demoNN@`, `ponente3–8@` sin documentar | Documentados | Yangfeng Liu | Cerrado |
| K1 | Constitución VII | LOW | `congreso123` en `seed.ts` | **Falso positivo**: es la credencial pública de demostración, documentada en quickstart; los secretos reales (`AUTH_SECRET`, `DATABASE_URL`) están en `.env`, fuera del repositorio | Yangfeng Liu | Descartado (justificado) |
