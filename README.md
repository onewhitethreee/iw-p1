# Congresalia · SI-19 Gestión de Eventos y Congresos (Grupo G16 · Yangfeng Liu)

Proyecto de Ingeniería Web (UA, 2026-27), Parte I: desarrollo mediante Spec-Driven Development con GitHub Spec Kit.

- Narrativa: [docs/descripcion-sistema.md](docs/descripcion-sistema.md)
- Historias de usuario: [docs/historias-usuario.md](docs/historias-usuario.md)
- Reparto: [docs/agrupamiento.md](docs/agrupamiento.md)
- Constitución: [.specify/memory/constitution.md](.specify/memory/constitution.md)
- Especificaciones: [specs/](specs/)
  - [000-core](specs/000-core/spec.md): base común (plan, modelo de datos y contrato de la API compartidos)
  - [001](specs/001-enviar-propuesta/spec.md) · [002](specs/002-evaluar-propuestas/spec.md) · [003](specs/003-programa-congreso/spec.md) · [004](specs/004-inscripcion-pago/spec.md) · [005](specs/005-agenda-personal/spec.md) · [006](specs/006-acceso-qr/spec.md) · [007](specs/007-certificado-asistencia/spec.md) · [008](specs/008-panel-tiempo-real/spec.md)
- Memoria: `docs/memoria.md` (se redacta en la fase 5 siguiendo el índice del ejemplo Biblioteca)

Pila: Next.js (App Router) · tRPC + Prisma · PostgreSQL · shadcn/ui
