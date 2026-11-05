// Generado por apps/web/demo/montar.ts — no editar a mano
window.DEMO = {
 "generado": "2026-11-05T09:07:01.377Z",
 "completo": {
  "video": "videos/demo-completa.mp4",
  "duracion": 1649.6000000000001
 },
 "historias": [
  {
   "id": "hu00",
   "hu": "BASE",
   "titulo": "Base común: portada, cuentas y roles",
   "video": "videos/hu00.mp4",
   "miniatura": "videos/miniaturas/hu00.jpg",
   "duracion": 92.92,
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
     "t": 7.192,
     "escenario": "US2-1",
     "titulo": "Portada pública sin iniciar sesión"
    },
    {
     "t": 16.778,
     "escenario": "US2-3",
     "titulo": "Ficha de un congreso"
    },
    {
     "t": 24.747999999999998,
     "escenario": "US2-2",
     "titulo": "Un congreso que no existe"
    },
    {
     "t": 30.253999999999998,
     "escenario": "US1-1",
     "titulo": "Registro como asistente"
    },
    {
     "t": 43.584,
     "escenario": "US1-5",
     "titulo": "Una misma cuenta con dos roles"
    },
    {
     "t": 52.952000000000005,
     "escenario": "US1-2",
     "titulo": "Zona de otro rol: acceso denegado"
    },
    {
     "t": 58.617000000000004,
     "escenario": "US1-3",
     "titulo": "Errores de registro e inicio de sesión"
    },
    {
     "t": 78.649,
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
   "duracion": 184.8,
   "inicio": 92.92,
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
     "t": 11.649999999999999,
     "escenario": "US1-1",
     "titulo": "Enviar una propuesta dentro del plazo"
    },
    {
     "t": 39.355000000000004,
     "escenario": "US1-7",
     "titulo": "La misma propuesta dos veces"
    },
    {
     "t": 60.002,
     "escenario": "US1-4",
     "titulo": "Formulario con datos no válidos"
    },
    {
     "t": 74.43900000000001,
     "escenario": "US1-2",
     "titulo": "Plazo de envío cerrado"
    },
    {
     "t": 85.789,
     "escenario": "US1-3",
     "titulo": "Plazo de envío que aún no ha abierto"
    },
    {
     "t": 100.416,
     "escenario": "US1-5",
     "titulo": "Área temática de otro congreso"
    },
    {
     "t": 108.25,
     "escenario": "US2-1",
     "titulo": "Mis propuestas y su estado"
    },
    {
     "t": 117.315,
     "escenario": "US2-3",
     "titulo": "El ponente no ve las evaluaciones"
    },
    {
     "t": 125.97,
     "escenario": "US2-4",
     "titulo": "Una propuesta enviada no se modifica ni se retira"
    },
    {
     "t": 135.89499999999998,
     "escenario": "US2-2",
     "titulo": "Cada ponente ve solo las suyas"
    },
    {
     "t": 150.195,
     "escenario": "US2-5",
     "titulo": "Ponente sin propuestas"
    },
    {
     "t": 163.809,
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
   "duracion": 189.36,
   "inicio": 277.72,
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
     "t": 11.619,
     "escenario": "US1-1",
     "titulo": "Mis evaluaciones, sin autoría"
    },
    {
     "t": 20.845,
     "escenario": "US1-3",
     "titulo": "Evaluación incompleta"
    },
    {
     "t": 34.126000000000005,
     "escenario": "US1-2",
     "titulo": "Guardar una evaluación"
    },
    {
     "t": 49.623000000000005,
     "escenario": "US1-5",
     "titulo": "Modificar mi evaluación antes de la decisión"
    },
    {
     "t": 64.85600000000001,
     "escenario": "US1-4",
     "titulo": "Propuesta no asignada"
    },
    {
     "t": 80.613,
     "escenario": "US2-1",
     "titulo": "Asignar un evaluador"
    },
    {
     "t": 93.072,
     "escenario": "US2-2",
     "titulo": "No se asigna al propio autor"
    },
    {
     "t": 101.706,
     "escenario": "US2-3",
     "titulo": "Evaluador ya asignado"
    },
    {
     "t": 109.563,
     "escenario": "US2-4",
     "titulo": "Asignar a alguien que no es del comité"
    },
    {
     "t": 117.425,
     "escenario": "US3-2",
     "titulo": "Decidir con menos de 2 evaluaciones"
    },
    {
     "t": 126.406,
     "escenario": "US3-4",
     "titulo": "Lista del organizador ordenada por media"
    },
    {
     "t": 133.768,
     "escenario": "US3-1",
     "titulo": "Aceptar con 2 evaluaciones"
    },
    {
     "t": 141.13199999999998,
     "escenario": "US3-5",
     "titulo": "No hay nota mínima"
    },
    {
     "t": 150.569,
     "escenario": "US3-3",
     "titulo": "Decidir dos veces"
    },
    {
     "t": 163.779,
     "escenario": "US2-5",
     "titulo": "Solo el organizador asigna"
    },
    {
     "t": 171.618,
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
   "duracion": 272.4,
   "inicio": 467.08000000000004,
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
     "t": 6.32,
     "escenario": "US3-2",
     "titulo": "Programa aún sin publicar"
    },
    {
     "t": 18.637999999999998,
     "escenario": "US1-1",
     "titulo": "Programar una ponencia aceptada"
    },
    {
     "t": 31.697,
     "escenario": "US1-2",
     "titulo": "Solape de ponente"
    },
    {
     "t": 43.712,
     "escenario": "US1-4",
     "titulo": "Intervalos contiguos"
    },
    {
     "t": 52.333000000000006,
     "escenario": "US1-3",
     "titulo": "Solape de sala"
    },
    {
     "t": 69.14,
     "escenario": "US1-6",
     "titulo": "Horario no válido"
    },
    {
     "t": 92.20700000000001,
     "escenario": "US1-5",
     "titulo": "Programar una propuesta no aceptada"
    },
    {
     "t": 100.049,
     "escenario": "US2-1",
     "titulo": "Mover una sesión sin conflictos"
    },
    {
     "t": 111.69500000000001,
     "escenario": "US2-2",
     "titulo": "Mover provocando un solape"
    },
    {
     "t": 127.22,
     "escenario": "US2-4",
     "titulo": "Quitar una sesión sin reservas"
    },
    {
     "t": 134.666,
     "escenario": "US3-1",
     "titulo": "Publicar el programa"
    },
    {
     "t": 142.375,
     "escenario": "US3-4",
     "titulo": "Cambios después de publicar"
    },
    {
     "t": 152.13,
     "escenario": "US3-1",
     "titulo": "El programa público"
    },
    {
     "t": 162.74499999999998,
     "escenario": "US3-5",
     "titulo": "Detalle de una sesión"
    },
    {
     "t": 171.897,
     "escenario": "US3-3",
     "titulo": "Preparado para buscadores (SEO)"
    },
    {
     "t": 197.21499999999997,
     "escenario": "US2-3",
     "titulo": "Mover a una sala más pequeña que las reservas"
    },
    {
     "t": 212.29899999999998,
     "escenario": "US2-4",
     "titulo": "Quitar una sesión con reservas"
    },
    {
     "t": 219.67999999999998,
     "escenario": "US2-5",
     "titulo": "Una sesión que ya ha empezado"
    },
    {
     "t": 241.86399999999998,
     "escenario": "US2-6",
     "titulo": "Congreso finalizado"
    },
    {
     "t": 259.395,
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
   "duracion": 203.08,
   "inicio": 739.48,
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
     "t": 6.322,
     "escenario": "US1-5",
     "titulo": "Inscribirse sin haber iniciado sesión"
    },
    {
     "t": 26.128,
     "escenario": "US1-1",
     "titulo": "Inscripción con tarifa temprana"
    },
    {
     "t": 35.07,
     "escenario": "US2-5",
     "titulo": "Inscripción pendiente en el área personal"
    },
    {
     "t": 42.951,
     "escenario": "US2-6",
     "titulo": "Se equivocó de tipo: cancelar y volver a inscribirse"
    },
    {
     "t": 67.325,
     "escenario": "US2-2",
     "titulo": "Pago rechazado"
    },
    {
     "t": 78.321,
     "escenario": "US2-1",
     "titulo": "Pago aprobado y acreditación con QR"
    },
    {
     "t": 92.625,
     "escenario": "US2-3",
     "titulo": "Sin pagos dobles"
    },
    {
     "t": 100.48700000000001,
     "escenario": "US2-7",
     "titulo": "Una inscripción pagada no se cancela"
    },
    {
     "t": 111.516,
     "escenario": "US1-3",
     "titulo": "Ya inscrito en ese congreso"
    },
    {
     "t": 123.25200000000001,
     "escenario": "US1-2",
     "titulo": "Pasado el día límite: precio general"
    },
    {
     "t": 132.284,
     "escenario": "US1-7",
     "titulo": "Importe manipulado en la petición"
    },
    {
     "t": 145.71599999999998,
     "escenario": "US2-4",
     "titulo": "Pagar la inscripción de otra persona"
    },
    {
     "t": 159.816,
     "escenario": "US1-4",
     "titulo": "Congreso finalizado"
    },
    {
     "t": 177.13299999999998,
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
   "duracion": 162.4,
   "inicio": 942.5600000000001,
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
     "t": 11.956,
     "escenario": "US1-6",
     "titulo": "Inscripción pendiente de pago: sin agenda"
    },
    {
     "t": 31.131999999999998,
     "escenario": "US1-1",
     "titulo": "Añadir una sesión"
    },
    {
     "t": 48.448,
     "escenario": "Estados",
     "titulo": "Sesiones ya empezadas"
    },
    {
     "t": 53.6,
     "escenario": "US1-2",
     "titulo": "Sesiones que se solapan"
    },
    {
     "t": 61.097,
     "escenario": "US1-3",
     "titulo": "Sesiones contiguas"
    },
    {
     "t": 68.282,
     "escenario": "US1-7",
     "titulo": "Añadir dos veces la misma sesión"
    },
    {
     "t": 76.148,
     "escenario": "US1-5",
     "titulo": "Dos personas a por la última plaza"
    },
    {
     "t": 89.406,
     "escenario": "US1-4",
     "titulo": "Sesión con el aforo completo"
    },
    {
     "t": 100.34400000000001,
     "escenario": "US2-1",
     "titulo": "Mi agenda, ordenada por día y hora"
    },
    {
     "t": 110.32600000000001,
     "escenario": "US2-4",
     "titulo": "El organizador mueve una sesión y provoca un solape"
    },
    {
     "t": 124.773,
     "escenario": "US2-2",
     "titulo": "Quitar una sesión futura"
    },
    {
     "t": 141.70499999999998,
     "escenario": "US2-3",
     "titulo": "Quitar una sesión que ya ha empezado"
    },
    {
     "t": 153.659,
     "escenario": "US1-8",
     "titulo": "La reserva guarda la plaza hasta 10 minutos después del inicio"
    }
   ]
  },
  {
   "id": "hu06",
   "hu": "HU-06",
   "titulo": "Controlar el acceso a la sala con QR",
   "video": "videos/hu06.mp4",
   "miniatura": "videos/miniaturas/hu06.jpg",
   "duracion": 208.96,
   "inicio": 1104.96,
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
     "t": 11.718,
     "escenario": "Previo",
     "titulo": "La acreditación del asistente"
    },
    {
     "t": 25.122999999999998,
     "escenario": "Puerta",
     "titulo": "Elegir la sesión que se controla"
    },
    {
     "t": 32.830000000000005,
     "escenario": "US1-1",
     "titulo": "Escanear un QR válido con la cámara"
    },
    {
     "t": 48.473000000000006,
     "escenario": "US1-7",
     "titulo": "Código escrito a mano"
    },
    {
     "t": 59.658,
     "escenario": "US1-5",
     "titulo": "Sale y vuelve a entrar"
    },
    {
     "t": 71.516,
     "escenario": "US1-8",
     "titulo": "Nadie está en dos sesiones a la vez"
    },
    {
     "t": 85.418,
     "escenario": "US2-1",
     "titulo": "Otra puerta de la misma sala"
    },
    {
     "t": 92.697,
     "escenario": "US1-3",
     "titulo": "Código que no existe"
    },
    {
     "t": 101.178,
     "escenario": "US1-4",
     "titulo": "Acreditación de otro congreso o no confirmada"
    },
    {
     "t": 117.794,
     "escenario": "Ventana",
     "titulo": "Una sesión que aún no ha abierto"
    },
    {
     "t": 130.07399999999998,
     "escenario": "US1-2",
     "titulo": "Sala con el aforo completo"
    },
    {
     "t": 145.988,
     "escenario": "US1-9",
     "titulo": "Plazas reservadas de quien no se presenta"
    },
    {
     "t": 174.06199999999998,
     "escenario": "Sin red",
     "titulo": "Se cae la conexión"
    },
    {
     "t": 195.006,
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
   "duracion": 147.88,
   "inicio": 1313.92,
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
     "t": 11.729999999999999,
     "escenario": "US1-1",
     "titulo": "Asistencia del 80 %: certificado disponible"
    },
    {
     "t": 41.571000000000005,
     "escenario": "US1-8",
     "titulo": "Sesiones que se solapan por un cambio del programa"
    },
    {
     "t": 57.879000000000005,
     "escenario": "US1-4",
     "titulo": "Congreso que aún no ha terminado"
    },
    {
     "t": 75.922,
     "escenario": "US1-6",
     "titulo": "El certificado de otra persona"
    },
    {
     "t": 89.88000000000001,
     "escenario": "US1-2",
     "titulo": "Asistencia insuficiente"
    },
    {
     "t": 102.47200000000001,
     "escenario": "US1-3",
     "titulo": "Descarga forzada por URL"
    },
    {
     "t": 116.47800000000001,
     "escenario": "US1-5",
     "titulo": "Agenda vacía"
    },
    {
     "t": 132.29899999999998,
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
   "duracion": 187.8,
   "inicio": 1461.8000000000002,
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
     "t": 12.117999999999999,
     "escenario": "US1-1",
     "titulo": "Inscripciones e ingresos con desglose"
    },
    {
     "t": 32.916000000000004,
     "escenario": "US1-2",
     "titulo": "Un pago nuevo aparece sin recargar"
    },
    {
     "t": 50.772000000000006,
     "escenario": "US2-1",
     "titulo": "Ocupación de cada sesión"
    },
    {
     "t": 58.124,
     "escenario": "US2-2",
     "titulo": "Una entrada en la puerta se refleja al momento"
    },
    {
     "t": 66.533,
     "escenario": "US2-3",
     "titulo": "Solo las sesiones llenas"
    },
    {
     "t": 73.408,
     "escenario": "US3-1",
     "titulo": "Buscar una sala más grande"
    },
    {
     "t": 82.171,
     "escenario": "US3-3",
     "titulo": "Otra persona ocupa la sala mientras decido"
    },
    {
     "t": 100.29,
     "escenario": "US3-2",
     "titulo": "Cambiar a una sala más grande"
    },
    {
     "t": 116.07300000000001,
     "escenario": "US3-4",
     "titulo": "Sesiones terminadas y congresos finalizados"
    },
    {
     "t": 140.04299999999998,
     "escenario": "US1-4",
     "titulo": "Congreso sin inscripciones"
    },
    {
     "t": 151.339,
     "escenario": "Sin red",
     "titulo": "Se cae la conexión"
    },
    {
     "t": 174.761,
     "escenario": "US1-3",
     "titulo": "Solo para la organización"
    }
   ]
  }
 ]
};
