# Quickstart: validar spec-004

Seed: `jornadas-pediatria-2027` (límite temprano futuro → precio temprano), `congreso-innovacion-educativa-2026` (en curso, límite pasado → general; `asistente4` pendiente con un pago rechazado; `asistente5` sin inscripción).

| # | Escenario | Pasos | Esperado |
|---|-----------|-------|----------|
| 1 | US1-1 temprana | `asistente5@` → Jornadas de Pediatría → Inscribirme → Estudiante | 90,00 € (temprano); «Pendiente de pago» |
| 2 | US1-2 general / P2 en curso | `asistente5@` → Innovación Educativa → Profesional | 300,00 € (general); se admite estando en curso |
| 3 | US2-2 rechazo | Pagar con 4000 0000 0000 0002 | «El pago ha sido rechazado…»; sigue pendiente |
| 4 | US2-1 aprobado | Pagar con 4111 1111 1111 1111 | «Confirmada» y QR visible |
| 5 | US1-3 duplicada | Volver a inscribirse en el mismo congreso | «Ya tienes una inscripción…» |
| 6 | US2-4 ajena | Integración: pagar la inscripción de otro | FORBIDDEN |
| 7 | US1-7 manipulada | Integración: enviar `importeCent` | Ignorado; importe del servidor |
