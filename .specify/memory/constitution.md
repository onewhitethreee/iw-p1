<!--
Sync Impact Report
- Versión: 1.0.0 → 1.1.0 (2026-11-03)
  - Modificado: «Flujo de trabajo del equipo» y «Gobernanza» se adaptan a un grupo de un integrante
    (Yangfeng Liu); la revisión cruzada pasa a ser autorrevisión diferida.
  - Añadido: referencia a los acuerdos A1–A10 de docs/agrupamiento.md como valores de 000-core.
  - Plantillas afectadas: ninguna (spec/plan/tasks siguen siendo compatibles).
- Versión: plantilla sin rellenar → 1.0.0 (2026-10-26)
- Principios añadidos: I. Simplicidad ante todo; II. Cero alcance fantasma; III. Verificable sin leer código;
  IV. Reglas de negocio en el servidor; V. Base común en 000-core; VI. Español de España y euro;
  VII. Datos personales con respeto
- Secciones añadidas: Restricciones técnicas; Flujo de trabajo del equipo; Gobernanza
- Pendientes: revisar en grupo antes del primer commit
-->

# Constitución de Congresalia (SI-19 Gestión de Eventos y Congresos)

## Principios

### I. Simplicidad ante todo
Entre dos soluciones se elige la más simple que cumpla la especificación. Es una versión 1 académica:
no se añaden capas, opciones ni configurabilidad "por si acaso".

### II. Cero alcance fantasma
No se implementa nada que no esté escrito en una especificación. Una idea nueva se propone al grupo
y solo se construye cuando entra en la spec correspondiente.

### III. Verificable sin leer código
Cada criterio de aceptación se redacta como «Dado… Cuando… Entonces…» y debe poder comprobarse
usando la aplicación. Toda historia tiene al menos un caso habitual, un caso de error o límite y
un caso de permisos o estado.

### IV. Reglas de negocio en el servidor (NO NEGOCIABLE)
Las reglas críticas (plazo de envío, anonimato, mínimo de dos evaluaciones, solapamientos de ponente,
sala y agenda, aforo, pago confirmado, 80 % de asistencia) se validan en el back-end (tRPC/Prisma).
Ocultar o desactivar un botón en la interfaz nunca es suficiente.

### V. Base común en 000-core
Las specs 001–008 se apoyan en el plan técnico y el modelo de datos de `specs/000-core`. Ninguna spec
redefine entidades, estados ni valores compartidos; si necesita cambiarlos, el cambio se acuerda en
grupo y se aplica primero en `000-core`.

### VI. Español de España y euro
Pantallas, mensajes y documentación en español de España. Importes en euros (€) con formato español;
fechas y horas en la zona horaria del congreso.

### VII. Datos personales con respeto
Se piden solo los datos imprescindibles. La autoría de las propuestas nunca se expone al comité.
No se escriben claves ni secretos en el código (se usan variables de entorno y `.env.example`).

## Restricciones técnicas

- Pila obligatoria: Next.js (App Router) + tRPC + Prisma + PostgreSQL + shadcn/ui sobre Tailwind CSS, en TypeScript.
- Las páginas públicas del programa se renderizan en servidor y llevan metadatos SEO.
- Base de datos local mediante `docker-compose`.
- Pruebas: unitarias/integración de las reglas de negocio y pruebas de extremo a extremo de los recorridos principales.

## Flujo de trabajo del equipo

- Ciclo por spec: specify → clarify → plan → tasks → analyze → implement → converge, repitiendo lo necesario.
- Una rama por spec (`spec-001` … `spec-008`) a partir de `main`; la base común vive en `main`.
- El grupo G16 tiene un único integrante (Yangfeng Liu), responsable de las ocho specs; firma todos los
  commits, documentos y tareas.
- La revisión cruzada que pide el enunciado se sustituye por una autorrevisión diferida: al menos un criterio
  de cada historia se vuelve a comprobar en una sesión de trabajo distinta a la de su redacción.
- Los valores de negocio comunes son los acuerdos A1–A10 de `docs/agrupamiento.md`, recogidos en `000-core`.
- Las salidas de clarify, analyze y converge se conservan en el repositorio como evidencia de las iteraciones.

## Gobernanza

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Cualquier cambio lo decide el
integrante del grupo, se registra en el Sync Impact Report y sube la versión (MAJOR: se elimina o
redefine un principio; MINOR: se añade un principio o sección; PATCH: aclaraciones). Los planes y las
revisiones de `/speckit-analyze` comprueban el cumplimiento de estos principios.

**Version**: 1.1.0 | **Ratified**: 2026-10-26 | **Last Amended**: 2026-11-03
