# SI-19 · Gestión de Eventos y Congresos (descripción narrativa)

> Transcripción del documento facilitado por el profesor (`SI-19-eventos-congresos-descripcion-narrativa.pdf`). Es el **único punto de partida funcional** del proyecto.

**Pila propuesta:** Next.js (App Router) · tRPC + Prisma · PostgreSQL · shadcn/ui

Congresalia es una empresa dedicada a organizar congresos profesionales y científicos, sobre todo en los ámbitos de la salud y la educación. Cada año organiza entre ocho y diez eventos, algunos con más de mil asistentes, decenas de sesiones paralelas y cientos de ponencias. Hasta ahora cada fase del congreso se llevaba con una herramienta distinta, y la empresa quiere unificarlo todo en un único sistema de información.

Todo congreso empieza mucho antes de que se celebre, con la llamada a comunicaciones. Los ponentes interesados envían una propuesta de ponencia con un resumen y el área temática en la que encaja. Las propuestas solo se admiten mientras está abierto el plazo de envío; una vez cerrado, el sistema no debe aceptar ninguna más.

A continuación entra en juego el comité científico, formado por expertos del área. Cada miembro del comité tiene asignadas una serie de propuestas que debe evaluar con una puntuación y comentarios, para seleccionar las mejores ponencias. La revisión es anónima: el evaluador no sabe quién es el autor de la propuesta. Para que la selección sea justa, cada propuesta debe recibir al menos dos evaluaciones.

Con las ponencias aceptadas, el equipo organizador monta el programa del congreso, asignando cada ponencia a una sala y a un horario. Este trabajo se hace con mucho cuidado, porque un error típico es que un mismo ponente acabe con dos sesiones a la misma hora; el sistema no debe permitir que eso ocurra. Una vez montado, el programa se publica en la web del congreso, y es importante que esas páginas públicas estén bien posicionadas en los buscadores.

Los asistentes se inscriben en el congreso eligiendo su tipo de entrada. Hay varias tarifas según el tipo de asistente (profesional, socio de la sociedad científica, estudiante) y según la fecha de inscripción, con un precio reducido para quienes se inscriben pronto. La inscripción solo se confirma cuando se ha pagado. Una vez inscritos, los asistentes pueden construir su agenda personal añadiendo las sesiones a las que quieren ir, aunque el sistema no les dejará añadir dos sesiones que se solapen en el tiempo ni sesiones cuyo aforo ya esté completo.

Durante el congreso, el personal de acreditación se coloca a la entrada de cada sala y escanea la acreditación de cada asistente, que este lleva en el móvil como un código QR. Así se controla tanto el aforo como la asistencia real: si la sala ya ha alcanzado su aforo, el sistema rechaza la entrada. Ese registro de asistencia tiene otra utilidad. Al terminar el congreso, muchos asistentes necesitan un certificado de asistencia para justificar sus horas de formación. El certificado podrá descargarse desde el área personal, pero solo si consta que la persona ha asistido al menos al ochenta por ciento de las sesiones de su agenda.

Mientras dura el evento, los organizadores quieren tener a mano un panel con las inscripciones, los ingresos y la ocupación de cada sesión, actualizado en tiempo real y con el desglose por tipo de entrada, para poder tomar decisiones sobre la marcha, como cambiar una sesión a una sala más grande.

La propuesta técnica para el sistema plantea Next.js con App Router, que permite renderizar en servidor las páginas públicas del programa, tRPC con Prisma para el back-end, PostgreSQL como base de datos y componentes shadcn/ui sobre Tailwind CSS.
