# Research: Núcleo común (000-core)

**Fecha**: 2026-11-03 · **Responsable**: Yangfeng Liu

Cada decisión resuelve una incógnita del *Technical Context* de [plan.md](plan.md). Formato: Decisión · Motivo · Alternativas.

## R1. Estructura del repositorio
- **Decisión**: monorepo con pnpm workspaces: `apps/web` (Next.js) y `packages/domain` (reglas de negocio puras en TypeScript, sin dependencias de base de datos).
- **Motivo**: lo pide el índice de la memoria («monorepo, apps/ y packages/»). Separar las reglas (solapamiento, tarifa, porcentaje del certificado, transiciones de estado) permite probarlas con pruebas unitarias rápidas y reutilizarlas en el servidor.
- **Alternativas**: una sola aplicación Next.js (más simple, pero mezcla reglas y acceso a datos); Turborepo (innecesario con dos paquetes).

## R2. Autenticación
- **Decisión**: Auth.js v5 (`next-auth`) con proveedor *Credentials* (correo y contraseña con hash bcrypt) y sesión JWT. Los roles **no** se fían del token: el contexto de tRPC los relee de la base de datos en cada petición.
- **Motivo**: integración nativa con App Router. Releer los roles cubre el caso límite de retirar un rol con la sesión abierta (spec 000-core, Edge Cases).
- **Alternativas**: sesiones propias con `iron-session` (más código propio); OAuth (no lo pide la narrativa).

## R3. Autorización
- **Decisión**: procedimientos tRPC `publicProcedure`, `protectedProcedure` y `roleProcedure(...roles)`. Toda regla de negocio se valida dentro del procedimiento (Constitución IV).
- **Alternativas**: middleware de Next.js por ruta (no protege las llamadas directas a la API).

## R4. Concurrencia en aforo y solapamientos
- **Decisión**: transacción interactiva de Prisma que bloquea la fila de la sesión (`SELECT … FOR UPDATE`) antes de contar las agendas o asistencias e insertar. Para los solapamientos de sala y ponente, la transacción bloquea las sesiones del congreso afectadas.
- **Motivo**: evita sobrepasar el aforo cuando dos asistentes reservan la última plaza a la vez.
- **Alternativas**: aislamiento `Serializable` con reintentos (más complejo de probar); restricción de exclusión `btree_gist` (solo cubre la sala, no el ponente ni la agenda).

## R5. Tiempo real del panel (acuerdo A9)
- **Decisión**: TanStack Query con `refetchInterval: 5000` sobre una consulta tRPC agregada.
- **Alternativas**: suscripciones tRPC/SSE (necesitan un servidor con estado y añaden complejidad sin ganancia visible con este volumen).

## R6. Páginas públicas y SEO
- **Decisión**: Server Components con `generateMetadata` (title, description, Open Graph, canonical), JSON-LD `Event` y `schema.org/EducationEvent` por sesión, `app/sitemap.ts` y `app/robots.ts`. Las páginas se regeneran con `revalidatePath` al publicar o cambiar el programa.
- **Alternativas**: renderizado en cliente (malo para buscadores, lo descarta la narrativa).

## R7. Acreditación QR
- **Decisión**: código de acreditación aleatorio no adivinable (UUID v4) guardado en la inscripción; el QR se genera con `qrcode` en el servidor. El personal escanea con la cámara (`html5-qrcode`) y dispone de un campo para escribir el código a mano.
- **Alternativas**: QR firmado con JWT (no hace falta: el servidor siempre comprueba el código contra la base de datos).

## R8. Certificado
- **Decisión**: PDF generado en el servidor con `pdf-lib`, que se entrega en un *route handler* que vuelve a comprobar las condiciones (congreso finalizado y ≥ 80 %).
- **Alternativas**: HTML imprimible (no es un fichero descargable).

## R9. Importes y fechas
- **Decisión**: importes en **céntimos (entero)**; fechas como `timestamptz` en UTC; formato con `Intl` (`es-ES`, `EUR`, zona horaria del congreso).
- **Alternativas**: `Decimal` (innecesario para sumas de enteros).

## R10. Pruebas
- **Decisión**: Vitest para `packages/domain` (unitarias) y para los routers tRPC contra una base PostgreSQL de pruebas (integración, llamando con `createCaller`); Playwright para los recorridos de extremo a extremo.
- **Motivo**: la Constitución pide pruebas de reglas y de recorridos; `createCaller` demuestra que las reglas se aplican aunque se salte la interfaz (SC-001).

## R11. UI
- **Decisión**: shadcn/ui sobre Tailwind CSS v4; formularios con `react-hook-form` + `zod` (el mismo esquema zod valida en cliente y servidor).

## R12. Pago simulado (acuerdo A5)
- **Decisión**: pantalla de «pasarela» propia con dos botones de resultado (aprobar / rechazar). Una tarjeta de prueba `4000 0000 0000 0002` provoca el rechazo para poder demostrar el caso de error. No se guarda ningún dato de tarjeta.
