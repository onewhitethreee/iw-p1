// Generado por apps/web/demo/montar.ts — no editar a mano
window.DEMO = {
 "generado": "2026-11-04T14:17:54.094Z",
 "completo": {
  "video": "videos/demo-completa.mp4",
  "duracion": 1516.44
 },
 "historias": [
  {
   "id": "hu00",
   "hu": "BASE",
   "titulo": "Base común: portada, cuentas y roles",
   "video": "videos/hu00.mp4",
   "miniatura": "videos/miniaturas/hu00.jpg",
   "duracion": 94.2,
   "inicio": 0,
   "rol": "Visitante y usuarios registrados",
   "como": "Base común del sistema: portada pública, registro, inicio de sesión y una zona por rol.",
   "criterios": [
    "Portada con los congresos y su fase",
    "Registro e inicio de sesión con mensajes de error claros",
    "Cada zona solo para su rol; una cuenta puede tener varios roles"
   ],
   "spec": "specs/000-core/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Congresalia: portada, cuentas y roles"
    },
    {
     "t": 7.115,
     "escenario": "US2-1",
     "titulo": "Portada pública sin iniciar sesión"
    },
    {
     "t": 16.811999999999998,
     "escenario": "US2-3",
     "titulo": "Ficha de un congreso"
    },
    {
     "t": 24.842,
     "escenario": "US2-2",
     "titulo": "Un congreso que no existe"
    },
    {
     "t": 30.402,
     "escenario": "US1-1",
     "titulo": "Registro como asistente"
    },
    {
     "t": 43.941,
     "escenario": "US1-5",
     "titulo": "Una misma cuenta con dos roles"
    },
    {
     "t": 53.465,
     "escenario": "US1-2",
     "titulo": "Zona de otro rol: acceso denegado"
    },
    {
     "t": 59.17,
     "escenario": "US1-3",
     "titulo": "Errores de registro e inicio de sesión"
    },
    {
     "t": 79.706,
     "escenario": "US1-4",
     "titulo": "Zona privada sin sesión"
    }
   ]
  },
  {
   "id": "hu01",
   "hu": "HU-01",
   "titulo": "Enviar propuesta de ponencia",
   "video": "videos/hu01.mp4",
   "miniatura": "videos/miniaturas/hu01.jpg",
   "duracion": 165.16,
   "inicio": 94.2,
   "rol": "Ponente",
   "como": "Como ponente, quiero enviar una propuesta de ponencia con un resumen y su área temática para que el comité científico la valore.",
   "criterios": [
    "Solo con el plazo de envío abierto",
    "Cerrado el plazo, se rechaza y se explica",
    "Título, resumen y área válida del congreso",
    "El ponente ve sus propuestas y su estado"
   ],
   "spec": "specs/001-enviar-propuesta/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Enviar propuesta de ponencia"
    },
    {
     "t": 11.782,
     "escenario": "US1-1",
     "titulo": "Enviar una propuesta dentro del plazo"
    },
    {
     "t": 40.034000000000006,
     "escenario": "US1-4",
     "titulo": "Formulario con datos no válidos"
    },
    {
     "t": 54.690000000000005,
     "escenario": "US1-2",
     "titulo": "Plazo de envío cerrado"
    },
    {
     "t": 66.07600000000001,
     "escenario": "US1-3",
     "titulo": "Plazo de envío que aún no ha abierto"
    },
    {
     "t": 80.61800000000001,
     "escenario": "US1-5",
     "titulo": "Área temática de otro congreso"
    },
    {
     "t": 88.46600000000001,
     "escenario": "US2-1",
     "titulo": "Mis propuestas y su estado"
    },
    {
     "t": 97.57900000000001,
     "escenario": "US2-3",
     "titulo": "El ponente no ve las evaluaciones"
    },
    {
     "t": 106.209,
     "escenario": "US2-4",
     "titulo": "Una propuesta enviada no se modifica ni se retira"
    },
    {
     "t": 116.141,
     "escenario": "US2-2",
     "titulo": "Cada ponente ve solo las suyas"
    },
    {
     "t": 130.488,
     "escenario": "US2-5",
     "titulo": "Ponente sin propuestas"
    },
    {
     "t": 144.26299999999998,
     "escenario": "US1-6",
     "titulo": "Sin rol de ponente o sin sesión"
    }
   ]
  },
  {
   "id": "hu02",
   "hu": "HU-02",
   "titulo": "Evaluar propuestas de forma anónima",
   "video": "videos/hu02.mp4",
   "miniatura": "videos/miniaturas/hu02.jpg",
   "duracion": 189.2,
   "inicio": 259.36,
   "rol": "Comité científico",
   "como": "Como miembro del comité científico, quiero evaluar las propuestas que tengo asignadas con una puntuación y comentarios para seleccionar las mejores ponencias.",
   "criterios": [
    "Solo ve las propuestas asignadas",
    "Revisión anónima: nunca se muestra el autor",
    "Puntuación y comentarios",
    "No se acepta sin al menos dos evaluaciones"
   ],
   "spec": "specs/002-evaluar-propuestas/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Evaluar propuestas de forma anónima"
    },
    {
     "t": 11.7,
     "escenario": "US1-1",
     "titulo": "Mis evaluaciones, sin autoría"
    },
    {
     "t": 20.934,
     "escenario": "US1-3",
     "titulo": "Evaluación incompleta"
    },
    {
     "t": 34.257000000000005,
     "escenario": "US1-2",
     "titulo": "Guardar una evaluación"
    },
    {
     "t": 49.754000000000005,
     "escenario": "US1-5",
     "titulo": "Modificar mi evaluación antes de la decisión"
    },
    {
     "t": 64.979,
     "escenario": "US1-4",
     "titulo": "Propuesta no asignada"
    },
    {
     "t": 80.691,
     "escenario": "US2-1",
     "titulo": "Asignar un evaluador"
    },
    {
     "t": 93.131,
     "escenario": "US2-2",
     "titulo": "No se asigna al propio autor"
    },
    {
     "t": 101.561,
     "escenario": "US2-3",
     "titulo": "Evaluador ya asignado"
    },
    {
     "t": 109.4,
     "escenario": "US2-4",
     "titulo": "Asignar a alguien que no es del comité"
    },
    {
     "t": 117.24900000000001,
     "escenario": "US3-2",
     "titulo": "Decidir con menos de 2 evaluaciones"
    },
    {
     "t": 126.07600000000001,
     "escenario": "US3-4",
     "titulo": "Lista del organizador ordenada por media"
    },
    {
     "t": 133.48,
     "escenario": "US3-1",
     "titulo": "Aceptar con 2 evaluaciones"
    },
    {
     "t": 140.849,
     "escenario": "US3-5",
     "titulo": "No hay nota mínima"
    },
    {
     "t": 150.31799999999998,
     "escenario": "US3-3",
     "titulo": "Decidir dos veces"
    },
    {
     "t": 163.523,
     "escenario": "US2-5",
     "titulo": "Solo el organizador asigna"
    },
    {
     "t": 171.397,
     "escenario": "US1-6",
     "titulo": "Evaluación de una propuesta ya decidida"
    }
   ]
  },
  {
   "id": "hu03",
   "hu": "HU-03",
   "titulo": "Montar y publicar el programa",
   "video": "videos/hu03.mp4",
   "miniatura": "videos/miniaturas/hu03.jpg",
   "duracion": 272.8,
   "inicio": 448.56,
   "rol": "Organizador",
   "como": "Como organizador, quiero asignar cada ponencia aceptada a una sala y un horario y publicar el programa para que los asistentes y el público lo consulten.",
   "criterios": [
    "Solo ponencias aceptadas",
    "Sin solapes de ponente",
    "Sin dos sesiones en la misma sala a la vez",
    "Programa público, renderizado en servidor y con SEO"
   ],
   "spec": "specs/003-programa-congreso/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Montar y publicar el programa"
    },
    {
     "t": 6.305000000000001,
     "escenario": "US3-2",
     "titulo": "Programa aún sin publicar"
    },
    {
     "t": 18.674,
     "escenario": "US1-1",
     "titulo": "Programar una ponencia aceptada"
    },
    {
     "t": 31.694,
     "escenario": "US1-2",
     "titulo": "Solape de ponente"
    },
    {
     "t": 43.625,
     "escenario": "US1-4",
     "titulo": "Intervalos contiguos"
    },
    {
     "t": 52.274,
     "escenario": "US1-3",
     "titulo": "Solape de sala"
    },
    {
     "t": 69.107,
     "escenario": "US1-6",
     "titulo": "Horario no válido"
    },
    {
     "t": 92.026,
     "escenario": "US1-5",
     "titulo": "Programar una propuesta no aceptada"
    },
    {
     "t": 99.87,
     "escenario": "US2-1",
     "titulo": "Mover una sesión sin conflictos"
    },
    {
     "t": 111.36500000000001,
     "escenario": "US2-2",
     "titulo": "Mover provocando un solape"
    },
    {
     "t": 126.827,
     "escenario": "US2-4",
     "titulo": "Quitar una sesión sin reservas"
    },
    {
     "t": 134.148,
     "escenario": "US3-1",
     "titulo": "Publicar el programa"
    },
    {
     "t": 141.898,
     "escenario": "US3-4",
     "titulo": "Cambios después de publicar"
    },
    {
     "t": 151.554,
     "escenario": "US3-1",
     "titulo": "El programa público"
    },
    {
     "t": 162.048,
     "escenario": "US3-5",
     "titulo": "Detalle de una sesión"
    },
    {
     "t": 171.255,
     "escenario": "US3-3",
     "titulo": "Preparado para buscadores (SEO)"
    },
    {
     "t": 196.86499999999998,
     "escenario": "US2-3",
     "titulo": "Mover a una sala más pequeña que las reservas"
    },
    {
     "t": 212.18099999999998,
     "escenario": "US2-4",
     "titulo": "Quitar una sesión con reservas"
    },
    {
     "t": 219.61499999999998,
     "escenario": "US2-5",
     "titulo": "Una sesión que ya ha empezado"
    },
    {
     "t": 241.94299999999998,
     "escenario": "US2-6",
     "titulo": "Congreso finalizado"
    },
    {
     "t": 259.69599999999997,
     "escenario": "US1-7",
     "titulo": "Solo la organización toca el programa"
    }
   ]
  },
  {
   "id": "hu04",
   "hu": "HU-04",
   "titulo": "Inscribirse y pagar la entrada",
   "video": "videos/hu04.mp4",
   "miniatura": "videos/miniaturas/hu04.jpg",
   "duracion": 160.88,
   "inicio": 721.36,
   "rol": "Asistente",
   "como": "Como asistente, quiero inscribirme eligiendo mi tipo de entrada y pagarla para asistir al congreso.",
   "criterios": [
    "Tarifa según tipo de asistente y fecha (temprana / general)",
    "Pendiente hasta que se paga",
    "Confirmada, obtiene su acreditación con QR"
   ],
   "spec": "specs/004-inscripcion-pago/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Inscribirse y pagar la entrada"
    },
    {
     "t": 6.297000000000001,
     "escenario": "US1-5",
     "titulo": "Inscribirse sin haber iniciado sesión"
    },
    {
     "t": 25.936,
     "escenario": "US1-1",
     "titulo": "Inscripción con tarifa temprana"
    },
    {
     "t": 34.885000000000005,
     "escenario": "US2-5",
     "titulo": "Inscripción pendiente en el área personal"
    },
    {
     "t": 42.753,
     "escenario": "US2-2",
     "titulo": "Pago rechazado"
    },
    {
     "t": 53.747,
     "escenario": "US2-1",
     "titulo": "Pago aprobado y acreditación con QR"
    },
    {
     "t": 67.976,
     "escenario": "US2-3",
     "titulo": "Sin pagos dobles"
    },
    {
     "t": 75.843,
     "escenario": "US1-3",
     "titulo": "Ya inscrito en ese congreso"
    },
    {
     "t": 87.596,
     "escenario": "US1-2",
     "titulo": "Pasado el día límite: precio general"
    },
    {
     "t": 96.607,
     "escenario": "US1-7",
     "titulo": "Importe manipulado en la petición"
    },
    {
     "t": 109.98100000000001,
     "escenario": "US2-4",
     "titulo": "Pagar la inscripción de otra persona"
    },
    {
     "t": 117.82300000000001,
     "escenario": "US1-4",
     "titulo": "Congreso finalizado"
    },
    {
     "t": 135.004,
     "escenario": "US1-6",
     "titulo": "Un ponente que quiere inscribirse"
    }
   ]
  },
  {
   "id": "hu05",
   "hu": "HU-05",
   "titulo": "Construir mi agenda personal",
   "video": "videos/hu05.mp4",
   "miniatura": "videos/miniaturas/hu05.jpg",
   "duracion": 155.48,
   "inicio": 882.24,
   "rol": "Asistente inscrito",
   "como": "Como asistente inscrito, quiero añadir a mi agenda las sesiones a las que quiero ir para organizar mi congreso.",
   "criterios": [
    "Solo con inscripción confirmada",
    "Sin sesiones solapadas",
    "Sin superar el aforo",
    "Quitar sesiones que no han empezado"
   ],
   "spec": "specs/005-agenda-personal/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Construir mi agenda personal"
    },
    {
     "t": 11.838999999999999,
     "escenario": "US1-6",
     "titulo": "Inscripción pendiente de pago: sin agenda"
    },
    {
     "t": 30.922,
     "escenario": "US1-1",
     "titulo": "Añadir una sesión"
    },
    {
     "t": 47.878,
     "escenario": "Estados",
     "titulo": "Sesiones ya empezadas"
    },
    {
     "t": 52.985,
     "escenario": "US1-2",
     "titulo": "Sesiones que se solapan"
    },
    {
     "t": 60.42,
     "escenario": "US1-3",
     "titulo": "Sesiones contiguas"
    },
    {
     "t": 67.616,
     "escenario": "US1-7",
     "titulo": "Añadir dos veces la misma sesión"
    },
    {
     "t": 75.543,
     "escenario": "US1-5",
     "titulo": "Dos personas a por la última plaza"
    },
    {
     "t": 88.556,
     "escenario": "US1-4",
     "titulo": "Sesión con el aforo completo"
    },
    {
     "t": 99.432,
     "escenario": "US2-1",
     "titulo": "Mi agenda, ordenada por día y hora"
    },
    {
     "t": 109.382,
     "escenario": "US2-4",
     "titulo": "El organizador mueve una sesión y provoca un solape"
    },
    {
     "t": 123.557,
     "escenario": "US2-2",
     "titulo": "Quitar una sesión futura"
    },
    {
     "t": 140.184,
     "escenario": "US2-3",
     "titulo": "Quitar una sesión que ya ha empezado"
    }
   ]
  },
  {
   "id": "hu06",
   "hu": "HU-06",
   "titulo": "Controlar el acceso a la sala con QR",
   "video": "videos/hu06.mp4",
   "miniatura": "videos/miniaturas/hu06.jpg",
   "duracion": 167.12,
   "inicio": 1037.72,
   "rol": "Personal de acreditación",
   "como": "Como personal de acreditación, quiero escanear el QR del asistente a la entrada de la sala para controlar el aforo y registrar la asistencia real.",
   "criterios": [
    "Sala llena: se rechaza",
    "QR no válido o no confirmado: se rechaza",
    "Cada entrada aceptada se registra como asistencia"
   ],
   "spec": "specs/006-acceso-qr/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Controlar el acceso a la sala con QR"
    },
    {
     "t": 11.699,
     "escenario": "Previo",
     "titulo": "La acreditación del asistente"
    },
    {
     "t": 24.617,
     "escenario": "Puerta",
     "titulo": "Elegir la sesión que se controla"
    },
    {
     "t": 32.144000000000005,
     "escenario": "US1-1",
     "titulo": "Escanear un QR válido con la cámara"
    },
    {
     "t": 47.229000000000006,
     "escenario": "US1-7",
     "titulo": "Código escrito a mano"
    },
    {
     "t": 58.404,
     "escenario": "US1-5",
     "titulo": "Sale y vuelve a entrar"
    },
    {
     "t": 70.274,
     "escenario": "US2-1",
     "titulo": "Otra puerta de la misma sala"
    },
    {
     "t": 79.769,
     "escenario": "US1-3",
     "titulo": "Código que no existe"
    },
    {
     "t": 88.31,
     "escenario": "US1-4",
     "titulo": "Acreditación de otro congreso o no confirmada"
    },
    {
     "t": 105.057,
     "escenario": "Ventana",
     "titulo": "Una sesión que aún no ha abierto"
    },
    {
     "t": 117.095,
     "escenario": "US1-2",
     "titulo": "Sala con el aforo completo"
    },
    {
     "t": 132.83499999999998,
     "escenario": "Sin red",
     "titulo": "Se cae la conexión"
    },
    {
     "t": 153.98899999999998,
     "escenario": "US1-6",
     "titulo": "Sin el rol de acreditación"
    }
   ]
  },
  {
   "id": "hu07",
   "hu": "HU-07",
   "titulo": "Descargar el certificado de asistencia",
   "video": "videos/hu07.mp4",
   "miniatura": "videos/miniaturas/hu07.jpg",
   "duracion": 130.32,
   "inicio": 1204.8400000000001,
   "rol": "Asistente",
   "como": "Como asistente, quiero descargar un certificado de asistencia desde mi área personal para justificar mis horas de formación.",
   "criterios": [
    "Solo al terminar el congreso",
    "Con asistencia a al menos el 80 % de la agenda",
    "Si no se cumple, se explica el motivo y el porcentaje"
   ],
   "spec": "specs/007-certificado-asistencia/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Descargar el certificado de asistencia"
    },
    {
     "t": 11.536,
     "escenario": "US1-1",
     "titulo": "Asistencia del 80 %: certificado disponible"
    },
    {
     "t": 41.18,
     "escenario": "US1-4",
     "titulo": "Congreso que aún no ha terminado"
    },
    {
     "t": 59.063,
     "escenario": "US1-6",
     "titulo": "El certificado de otra persona"
    },
    {
     "t": 72.928,
     "escenario": "US1-2",
     "titulo": "Asistencia insuficiente"
    },
    {
     "t": 85.517,
     "escenario": "US1-3",
     "titulo": "Descarga forzada por URL"
    },
    {
     "t": 99.387,
     "escenario": "US1-5",
     "titulo": "Agenda vacía"
    },
    {
     "t": 114.855,
     "escenario": "US1-7",
     "titulo": "Sin inscripción confirmada"
    }
   ]
  },
  {
   "id": "hu08",
   "hu": "HU-08",
   "titulo": "Panel del congreso en tiempo real",
   "video": "videos/hu08.mp4",
   "miniatura": "videos/miniaturas/hu08.jpg",
   "duracion": 181.28,
   "inicio": 1335.16,
   "rol": "Organizador",
   "como": "Como organizador, quiero un panel con inscripciones, ingresos y ocupación de cada sesión, con desglose por tipo de entrada, para tomar decisiones sobre la marcha.",
   "criterios": [
    "Inscripciones e ingresos, totales y por tipo de entrada",
    "Ocupación de cada sesión respecto a su aforo",
    "Actualización en tiempo real",
    "Mover sesiones llenas a una sala más grande"
   ],
   "spec": "specs/008-panel-tiempo-real/spec.md",
   "capitulos": [
    {
     "t": 0,
     "escenario": "Portada",
     "titulo": "Panel del congreso en tiempo real"
    },
    {
     "t": 11.652,
     "escenario": "US1-1",
     "titulo": "Inscripciones e ingresos con desglose"
    },
    {
     "t": 31.761,
     "escenario": "US1-2",
     "titulo": "Un pago nuevo aparece sin recargar"
    },
    {
     "t": 44.635000000000005,
     "escenario": "US2-1",
     "titulo": "Ocupación de cada sesión"
    },
    {
     "t": 51.914,
     "escenario": "US2-2",
     "titulo": "Una entrada en la puerta se refleja al momento"
    },
    {
     "t": 60.517,
     "escenario": "US2-3",
     "titulo": "Solo las sesiones llenas"
    },
    {
     "t": 67.401,
     "escenario": "US3-1",
     "titulo": "Buscar una sala más grande"
    },
    {
     "t": 76.177,
     "escenario": "US3-3",
     "titulo": "Otra persona ocupa la sala mientras decido"
    },
    {
     "t": 93.994,
     "escenario": "US3-2",
     "titulo": "Cambiar a una sala más grande"
    },
    {
     "t": 109.65,
     "escenario": "US3-4",
     "titulo": "Sesiones terminadas y congresos finalizados"
    },
    {
     "t": 133.509,
     "escenario": "US1-4",
     "titulo": "Congreso sin inscripciones"
    },
    {
     "t": 144.81799999999998,
     "escenario": "Sin red",
     "titulo": "Se cae la conexión"
    },
    {
     "t": 168.148,
     "escenario": "US1-3",
     "titulo": "Solo para la organización"
    }
   ]
  }
 ]
};
