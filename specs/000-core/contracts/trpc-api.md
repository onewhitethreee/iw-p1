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
| `evaluacion.miembrosComite` | query | ORGANIZADOR | — | `[{id, nombre}]` de usuarios con rol COMITE (para elegir evaluador). Añadido por spec-002 (analyze X1 de spec-003). |
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
| `programa.mover` | mutation | ORGANIZADOR | `{sesionId, salaId?, dia?, horaInicio?, horaFin?}` | Mismas reglas que `programar` + aforo de la nueva sala ≥ reservas; sesión empezada → solo `salaId`. (El panel usa `panel.cambiarSala`, que aplica las reglas de cambio de sala; spec-008.) |
| `programa.quitar` | mutation | ORGANIZADOR | `{sesionId}` | `CONFLICT` si tiene reservas o asistencias, ya empezó o el congreso ha finalizado. |
| `programa.publicar` | mutation | ORGANIZADOR | `{congresoId}` | Pasa a `PUBLICADO` (idempotente). |
| `programa.publico` | query | P | `{slug}` | Sesiones solo si está `PUBLICADO`. |
| `programa.sesionPublica` | query | P | `{slug, sesionId}` | Detalle público; `NOT_FOUND` si no procede. |

## inscripcion (spec-004)
| `inscripcion.presupuesto` | query | P | `{congresoId}` | Tarifa vigente hoy (temprana o general) e importe de cada tipo de asistente. Concretado por spec-004 (analyze C1). |
| `inscripcion.crear` | mutation | ASISTENTE | `{congresoId, tipoAsistente}` | Crea `PENDIENTE_PAGO` con el importe fijado (o reactiva la suya si estaba `CANCELADA`). `CONFLICT` si ya tiene una pendiente o confirmada, o si el congreso ha finalizado. |
| `inscripcion.cancelar` | mutation | ASISTENTE (propietario) | `{inscripcionId}` | `PENDIENTE_PAGO` → `CANCELADA`; conserva los pagos. `CONFLICT` si está confirmada. Añadido por spec-004 clarify-2 P4. |
| `inscripcion.pagar` | mutation | ASISTENTE (propietario) | `{inscripcionId, tarjeta}` | Pago simulado. Aprobado → `CONFIRMADA` + código de acreditación. Rechazado → sigue pendiente. `CONFLICT` si ya está confirmada. |
| `inscripcion.mias` | query | ASISTENTE | — | Inscripciones con estado y, si está confirmada, el QR. |

## agenda (spec-005)
| `agenda.congresos` | query | ASISTENTE | — | Congresos con inscripción confirmada (punto de entrada). Añadido por spec-005. |
| `agenda.sesiones` | query | ASISTENTE | `{congresoId}` | Sesiones publicadas con plazas libres y si están en su agenda. |
| `agenda.anadir` | mutation | ASISTENTE | `{sesionId}` | `FORBIDDEN` sin inscripción confirmada; `CONFLICT` si se solapa o el aforo está completo. |
| `agenda.quitar` | mutation | ASISTENTE | `{sesionId}` | `CONFLICT` si la sesión ya ha empezado. |
| `agenda.mia` | query | ASISTENTE | `{congresoId}` | Agenda ordenada por hora; cada entrada indica con qué otras se solapa por cambios del programa (spec-005 clarify P1). |

## acreditacion (spec-006)
| `acreditacion.sesiones` | query | ACREDITACION | `{congresoId}` | Sesiones para elegir la puerta, con asistencias, aforo y si está abierta (ventana `[inicio − 30 min, fin)`). Concretado por spec-006. |
| `acreditacion.escanear` | mutation | ACREDITACION | `{sesionId, codigo}` | Devuelve `{resultado: ADMITIDO\|YA_REGISTRADO\|RECHAZADO, motivo, asistente, ocupacion}`. Rechaza QR desconocido, inscripción no confirmada, de otro congreso, fuera de la ventana o aforo completo; quien no reservó solo entra si quedan plazas sin reservar («No quedan plazas sin reservar», spec-006 P3). No exige agenda (spec-006 P1). |
| `acreditacion.ocupacion` | query | ACREDITACION | `{sesionId}` | `{asistencias, aforo}` para refrescar la puerta. Añadido por spec-006. |

## certificado (spec-007)
| `certificado.congresos` | query | A | — | Congresos en los que el usuario tiene inscripción `CONFIRMADA`: `[{id, slug, nombre, fin, zonaHoraria, finalizado}]`. Añadido por spec-007. |
| `certificado.estado` | query | A (titular, spec-007 P1) | `{congresoId}` | `{estado: DISPONIBLE\|NO_FINALIZADO\|AGENDA_VACIA\|BAJO_UMBRAL\|SIN_INSCRIPCION, disponible, motivo, porcentaje (entero truncado, P2), asistidas, total, horas, sesiones[]}`. Siempre calcula sobre la inscripción del propio usuario. Concretado por spec-007. |
| `GET /api/certificado/[congresoId]` | route handler | A (titular) | — | PDF (`application/pdf`, adjunto `certificado-<slug>.pdf`); `401` sin sesión; `403` con el motivo en texto si no cumple las condiciones. Cualquier rol (spec-007 P1). |

## panel (spec-008)
| `panel.resumen` | query | ORGANIZADOR | `{congresoId}` | `{calculadoEn, inscripciones:{confirmadas, pendientes}, ingresosCent, desglose[6]: {tipoAsistente, tarifa, confirmadas, pendientes, ingresosCent}, sesiones[]: {id, titulo, sala, inicio, fin, aforo, reservas, asistencias, ocupacion (% entero), nivel: COMPLETA\|CASI_COMPLETA\|null, movible}}`. Ocupación = máx(reservas, asistencias) / aforo (spec-008 P1). Ingresos = pagos `APROBADO`. Se consulta cada 5 s. |
| `panel.salasLibres` | query | ORGANIZADOR | `{sesionId}` | `[{id, nombre, aforo}]`: otras salas del congreso sin solape en ese horario y con aforo ≥ máx(reservas, asistencias) (spec-008 P2). `CONFLICT` si la sesión no es movible (terminada o congreso finalizado, spec-008 P3). |
| `panel.cambiarSala` | mutation | ORGANIZADOR | `{sesionId, salaId}` | Cambia solo la sala con las reglas de spec-003 que aplican a un cambio de sala (solape de sala con mensaje que nombra la sesión, congreso finalizado) más P2/P3; bloqueo de la sala destino. Concretado por spec-008: no depende de `programa.mover`. |
