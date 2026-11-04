# Quickstart: validar spec-006

Seed `congreso-innovacion-educativa-2026` (en curso): «Rúbricas compartidas…» (Aula 3, aforo 2) ya tiene 2 asistencias; «Aprendizaje basado en proyectos…» (Auditorio) está en marcha; `asistente3` confirmado; `asistente4` pendiente.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 | `acreditacion@` → Innovación → «Aprendizaje basado en proyectos» → escribir el código de `asistente3` | «Admitido · Asistente 3», ocupación +1 |
| 2 | US1-5 | Repetir | «Ya registrado» (ámbar), sin +1 |
| 3 | US1-2 | «Rúbricas compartidas…» con el código de `asistente3` | «Rechazado: Aforo completo» |
| 4 | US1-3 | Código inventado | «Acreditación no válida» |
| 5 | US1-4 | Integración (d): en el seed una inscripción pendiente no tiene código | «Inscripción no confirmada» / «Acreditación de otro congreso» |
| 5b | FR-009 / P3 | Integración (h2): sala de aforo 2 con 1 reserva y 1 sin reserva dentro | Otro sin reserva: «No quedan plazas sin reservar» |
| 5c | FR-009 matizada (spec-005 P2) | Integración (k): sala de aforo 2 con 2 reservas sin presentarse | Sin reserva: 10:09 «No quedan plazas sin reservar», 10:10 admitido |
| 5d | US1-8 / FR-011 (clarify-3 P4) | Integración (l): admitido en una sesión y escaneado en otra solapada; después en una contigua | «Ya registrado en «…» a esta hora» sin consumir aforo; la contigua se admite |
| 6 | US1-6 | `asistente1@` en `/acreditacion` | Acceso denegado |
| 7 | SC-002 | Integración: 10 escaneos simultáneos con 1 plaza | 1 admitido |
