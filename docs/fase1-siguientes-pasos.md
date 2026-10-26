# Fase 1 · Siguientes pasos (para hacer en grupo)

Abrid Claude Code en esta carpeta (las skills de Spec Kit ya están en `.claude/skills`).

## 1. Revisar y acordar
- [ ] Revisar `docs/historias-usuario.md` (HU-01…HU-08).
- [ ] Rellenar nombres en `docs/agrupamiento.md` y cerrar los 10 acuerdos.
- [ ] Revisar `.specify/memory/constitution.md` (o regenerarla con `/speckit-constitution`).

## 2. Spec común 000-core
```
/speckit-specify Crea una spec 000-core que sea la fuente única de verdad compartida por las 8 specs: vocabulario, entidades (Congreso, Área temática, Propuesta, Evaluación, Sala, Sesión, Tipo de entrada/Tarifa, Inscripción, Pago, Agenda, Asistencia, Usuario y roles), estados y valores de negocio, y los acuerdos de docs/agrupamiento.md. No añade pantallas propias. Usa docs/descripcion-sistema.md como narrativa.
```
Luego `/speckit-plan` sobre 000-core con la pila: *Next.js (App Router) · tRPC + Prisma · PostgreSQL · shadcn/ui sobre Tailwind, monorepo apps/web; el plan y el modelo de datos se comparten entre las 8 specs*.

## 3. Las 8 specs (petición orientativa de la guía)
```
/speckit-specify Esta es la narrativa (docs/descripcion-sistema.md) y estas son nuestras 8 historias de usuario (docs/historias-usuario.md). Trabajamos en un grupo de 4 personas y cada una se responsabilizará de 2 historias según docs/agrupamiento.md. Genera 8 specs, una por historia, identificadas como spec-001, spec-002, …, spec-008, apoyadas en specs/000-core.
```

## 4. GitHub
- [ ] Crear el repositorio del grupo y subir la base común a `main`.
- [ ] Crear las 8 ramas `spec-001` … `spec-008`.
- [ ] Cada persona continúa en sus ramas: clarify → plan → tasks → analyze → implement → converge.
