# Contrato: router `acreditacion` (spec-006)

| Procedimiento | Tipo | Acceso | Entrada | Salida |
|---------------|------|--------|---------|--------|
| `sesiones` | query | ACREDITACION | `{ congresoId }` | `[{ id, titulo, sala, inicio, fin, aforo, asistencias, abierta }]` |
| `escanear` | mutation | ACREDITACION | `{ sesionId, codigo }` | `{ resultado: "ADMITIDO" \| "YA_REGISTRADO" \| "RECHAZADO", motivo, asistente: string \| null, ocupacion: { asistencias, aforo } }` |
| `ocupacion` | query | ACREDITACION | `{ sesionId }` | `{ asistencias, aforo }` |

| Resultado | Motivo |
|-----------|--------|
| ADMITIDO | «Admitido» |
| YA_REGISTRADO | «Ya registrado en esta sesión» |
| RECHAZADO | «Acreditación no válida» · «Acreditación de otro congreso» · «Inscripción no confirmada» · «La sesión aún no está abierta (se abre a las HH:mm)» · «La sesión ya ha terminado» · «Aforo completo» · «No quedan plazas sin reservar» (clarify P3) |

`FORBIDDEN` solo para usuarios sin rol ACREDITACION; `NOT_FOUND` si la sesión no existe.
