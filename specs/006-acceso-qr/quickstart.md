# Quickstart: validar spec-006

Seed `congreso-innovacion-educativa-2026` (en curso): «Rúbricas compartidas…» (Aula 3, aforo 2) ya tiene 2 asistencias; «Aprendizaje basado en proyectos…» (Auditorio) está en marcha; `asistente3` confirmado; `asistente4` pendiente.

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 | `acreditacion@` → Innovación → «Aprendizaje basado en proyectos» → escribir el código de `asistente3` | «Admitido · Asistente 3», ocupación +1 |
| 2 | US1-5 | Repetir | «Ya registrado» (ámbar), sin +1 |
| 3 | US1-2 | «Rúbricas compartidas…» con el código de `asistente3` | «Rechazado: Aforo completo» |
| 4 | US1-3 | Código inventado | «Acreditación no válida» |
| 5 | US1-4 | Código de una inscripción pendiente | «Inscripción no confirmada» |
| 6 | US1-6 | `asistente1@` en `/acreditacion` | Acceso denegado |
| 7 | SC-002 | Integración: 10 escaneos simultáneos con 1 plaza | 1 admitido |
