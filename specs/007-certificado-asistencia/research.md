# Research: Certificado de asistencia (spec-007)

- **R1 Cálculo compartido** — Decisión: una función de servidor usada por la pantalla y por la descarga. Motivo: FR-005 exige recomprobar; con una sola función la pantalla y el PDF no pueden discrepar. Alternativa: duplicar consultas en el *route handler* (riesgo de divergencia).
- **R2 Orden de estados** — Decisión: inscripción → finalización → agenda vacía → umbral. Motivo: el motivo mostrado es el más básico que impide el certificado; antes de terminar el congreso se informa de la fecha y del porcentaje provisional (US1-4).
- **R3 Titularidad** — Decisión: la ruta solo recibe `congresoId` y usa la inscripción del usuario de la sesión. Motivo: hace imposible pedir el certificado de otra persona (P1, US1-6) sin comprobaciones adicionales. Alternativa: `/api/certificado/[inscripcionId]` + comprobación de propiedad (más superficie de error).
- **R4 Recuento** — Decisión: denominador = agenda; numerador = agenda ∩ asistencias. Motivo: FR-002 y Edge Cases.
- **R5 Porcentaje truncado** — Decisión: `Math.floor`. Motivo: P2; nunca muestra 80 % a quien no llega. Afecta a una función de 000-core (`packages/domain`), cuyo plan se actualiza primero.
- **R6 PDF** — Decisión: `pdf-lib` en el servidor, fuentes estándar. Motivo: R6 de 000-core; sin navegador ni binarios; genera en milisegundos (SC-002). Alternativa: `@react-pdf/renderer` (más pesado) o Puppeteer (navegador en servidor).
- **R7 Ruta de pantallas** — Decisión: `/area-personal/certificado/[slug]`, igual que la agenda de spec-005 (`/area-personal/agenda/[slug]`). Se actualiza la tabla del plan de 000-core.
