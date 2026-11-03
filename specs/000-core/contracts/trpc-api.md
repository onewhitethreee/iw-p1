# Contrato de la API tRPC (compartido)

**Fecha**: 2026-11-03 · **Responsable**: Yangfeng Liu

Todos los procedimientos validan la entrada con zod y devuelven errores tRPC con código y un mensaje en español
listo para mostrar. Códigos usados: `UNAUTHORIZED` (sin sesión), `FORBIDDEN` (rol o propiedad incorrectos),
`NOT_FOUND`, `BAD_REQUEST` (datos inválidos), `CONFLICT` (regla de negocio o estado incompatible).

Leyenda de acceso: **P** público · **A** cualquier usuario con sesión · rol concreto en otro caso.

## auth (000-core)
| Procedimiento | Tipo | Acceso | Entrada | Salida / reglas |
|---------------|------|--------|---------|-----------------|
| `auth.registrar` | mutation | P | `{nombre, email, password, rol: PONENTE\|ASISTENTE}` | Crea el usuario. `CONFLICT` si el correo existe. |
| `auth.yo` | query | A | — | `{id, nombre, email, roles[]}` |
| `auth.asignarRol` | mutation | ORGANIZADOR | `{usuarioId, rol}` | Añade un rol. |
| `auth.anadirRolPropio` | mutation | A | `{rol: PONENTE\|ASISTENTE}` | Clarify P2. Añade el rol al propio usuario (idempotente). Cualquier otro rol → `BAD_REQUEST`. |

## congreso (000-core)
| `congreso.listar` | query | P | — | Congresos con fase calculada. |
| `congreso.porSlug` | query | P | `{slug}` | Datos públicos, áreas, tarifas y salas (nombre y aforo). `NOT_FOUND` si no existe. |

## propuesta (spec-001)
| `propuesta.enviar` | mutation | PONENTE | `{congresoId, areaId, titulo, resumen}` | `CONFLICT` si el plazo está cerrado o no ha abierto; `BAD_REQUEST` si el área no es del congreso. |
| `propuesta.mias` | query | PONENTE | `{congresoId?}` | Propuestas del autor con su estado. |

## evaluacion (spec-002)
| `evaluacion.asignar` | mutation | ORGANIZADOR | `{propuestaId, evaluadorId}` | `CONFLICT` si el evaluador es el autor, ya estaba asignado o la propuesta está decidida. |
| `evaluacion.misAsignaciones` | query | COMITE | `{congresoId}` | Lista **sin** datos de autor. |
| `evaluacion.detalle` | query | COMITE | `{asignacionId}` | Título, resumen y área; **sin** datos de autor. `FORBIDDEN` si no es su asignación. |
| `evaluacion.evaluar` | mutation | COMITE | `{asignacionId, puntuacion 1–10, comentarios}` | `CONFLICT` si la propuesta ya está decidida. |
| `evaluacion.resumenOrganizador` | query | ORGANIZADOR | `{congresoId}` | Propuestas con nº de evaluaciones y media. |
| `evaluacion.decidir` | mutation | ORGANIZADOR | `{propuestaId, decision: ACEPTAR\|RECHAZAR}` | `CONFLICT` si hay < 2 evaluaciones o ya está decidida. |

## programa (spec-003)
Horario de entrada: `{dia: "AAAA-MM-DD", horaInicio: "HH:mm", horaFin: "HH:mm"}` en la zona del congreso, mismo día (spec-003 clarify P2/P3). Detalle y mensajes: [spec-003/contracts/programa.md](../../003-programa-congreso/contracts/programa.md).

| Procedimiento | Tipo | Acceso | Entrada | Salida / reglas |
|---------------|------|--------|---------|-----------------|
| `programa.pendientes` | query | ORGANIZADOR | `{congresoId}` | Propuestas aceptadas aún sin sesión. |
| `programa.sesiones` | query | ORGANIZADOR | `{congresoId}` | Sesiones con sala, ponencia, reservas y asistencias. |
| `programa.programar` | mutation | ORGANIZADOR | `{propuestaId, salaId, dia, horaInicio, horaFin}` | `CONFLICT` si la propuesta no está aceptada, solapa sala o ponente, o el congreso ha finalizado; `BAD_REQUEST` si el horario es inválido o cae fuera de las fechas. |
| `programa.mover` | mutation | ORGANIZADOR | `{sesionId, salaId?, dia?, horaInicio?, horaFin?}` | Mismas reglas que `programar` + aforo de la nueva sala ≥ reservas; sesión empezada → solo `salaId` (lo usa spec-008). |
| `programa.quitar` | mutation | ORGANIZADOR | `{sesionId}` | `CONFLICT` si tiene reservas o asistencias, ya empezó o el congreso ha finalizado. |
| `programa.publicar` | mutation | ORGANIZADOR | `{congresoId}` | Pasa a `PUBLICADO` (idempotente). |
| `programa.publico` | query | P | `{slug}` | Sesiones solo si está `PUBLICADO`. |
| `programa.sesionPublica` | query | P | `{slug, sesionId}` | Detalle público; `NOT_FOUND` si no procede. |

## inscripcion (spec-004)
| `inscripcion.presupuesto` | query | P | `{congresoId, tipoAsistente}` | Tarifa vigente hoy (temprana o general) e importe. |
| `inscripcion.crear` | mutation | ASISTENTE | `{congresoId, tipoAsistente}` | Crea `PENDIENTE_PAGO` con el importe fijado. `CONFLICT` si ya tiene inscripción o el congreso ha finalizado. |
| `inscripcion.pagar` | mutation | ASISTENTE (propietario) | `{inscripcionId, tarjeta}` | Pago simulado. Aprobado → `CONFIRMADA` + código de acreditación. Rechazado → sigue pendiente. `CONFLICT` si ya está confirmada. |
| `inscripcion.mias` | query | ASISTENTE | — | Inscripciones con estado y, si está confirmada, el QR. |

## agenda (spec-005)
| `agenda.sesiones` | query | ASISTENTE | `{congresoId}` | Sesiones publicadas con plazas libres y si están en su agenda. |
| `agenda.anadir` | mutation | ASISTENTE | `{sesionId}` | `FORBIDDEN` sin inscripción confirmada; `CONFLICT` si se solapa o el aforo está completo. |
| `agenda.quitar` | mutation | ASISTENTE | `{sesionId}` | `CONFLICT` si la sesión ya ha empezado. |
| `agenda.mia` | query | ASISTENTE | `{congresoId}` | Agenda ordenada por hora. |

## acreditacion (spec-006)
| `acreditacion.sesionesDeHoy` | query | ACREDITACION | `{congresoId}` | Sesiones para elegir la puerta. |
| `acreditacion.escanear` | mutation | ACREDITACION | `{sesionId, codigo}` | Devuelve `{resultado: ADMITIDO\|YA_REGISTRADO\|RECHAZADO, motivo, ocupacion}`. Rechaza QR desconocido, inscripción no confirmada, de otro congreso o aforo completo. |

## certificado (spec-007)
| `certificado.estado` | query | ASISTENTE | `{congresoId}` | `{disponible, motivo, porcentaje, asistidas, total, horas}` |
| `GET /api/certificado/[congresoId]` | route handler | ASISTENTE (propietario) | — | PDF; `403` con motivo si no cumple las condiciones. |

## panel (spec-008)
| `panel.resumen` | query | ORGANIZADOR | `{congresoId}` | Inscripciones (confirmadas/pendientes), ingresos y desglose por tipo de asistente y tarifa; ocupación (reservas y asistencias) de cada sesión frente a su aforo; momento del cálculo. Se consulta cada 5 s. |
| `panel.salasLibres` | query | ORGANIZADOR | `{sesionId}` | Salas sin solape en ese horario con aforo ≥ reservas de la sesión. |
