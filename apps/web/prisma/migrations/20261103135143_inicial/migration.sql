-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ORGANIZADOR', 'COMITE', 'PONENTE', 'ASISTENTE', 'ACREDITACION');

-- CreateEnum
CREATE TYPE "EstadoPropuesta" AS ENUM ('ENVIADA', 'EN_EVALUACION', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "TipoAsistente" AS ENUM ('PROFESIONAL', 'SOCIO', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "TarifaAplicada" AS ENUM ('TEMPRANA', 'GENERAL');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('PENDIENTE_PAGO', 'CONFIRMADA');

-- CreateEnum
CREATE TYPE "ResultadoPago" AS ENUM ('APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoPrograma" AS ENUM ('BORRADOR', 'PUBLICADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "usuarioId" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("usuarioId","rol")
);

-- CreateTable
CREATE TABLE "Congreso" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "sede" TEXT NOT NULL,
    "zonaHoraria" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "inicio" TIMESTAMPTZ NOT NULL,
    "fin" TIMESTAMPTZ NOT NULL,
    "envioAbre" TIMESTAMPTZ NOT NULL,
    "envioCierra" TIMESTAMPTZ NOT NULL,
    "limiteTemprana" TIMESTAMPTZ NOT NULL,
    "estadoPrograma" "EstadoPrograma" NOT NULL DEFAULT 'BORRADOR',
    "publicadoEn" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Congreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaTematica" (
    "id" TEXT NOT NULL,
    "congresoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "AreaTematica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propuesta" (
    "id" TEXT NOT NULL,
    "congresoId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "estado" "EstadoPropuesta" NOT NULL DEFAULT 'ENVIADA',
    "enviadaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decididaEn" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Propuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" TEXT NOT NULL,
    "propuestaId" TEXT NOT NULL,
    "evaluadorId" TEXT NOT NULL,
    "asignadaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluacion" (
    "id" TEXT NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentarios" TEXT NOT NULL,
    "evaluadaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "congresoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "aforo" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "congresoId" TEXT NOT NULL,
    "propuestaId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,
    "inicio" TIMESTAMPTZ NOT NULL,
    "fin" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarifa" (
    "id" TEXT NOT NULL,
    "congresoId" TEXT NOT NULL,
    "tipoAsistente" "TipoAsistente" NOT NULL,
    "importeTempranoCent" INTEGER NOT NULL,
    "importeGeneralCent" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" TEXT NOT NULL,
    "congresoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoAsistente" "TipoAsistente" NOT NULL,
    "tarifaAplicada" "TarifaAplicada" NOT NULL,
    "importeCent" INTEGER NOT NULL,
    "estado" "EstadoInscripcion" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "codigoAcreditacion" TEXT,
    "creadaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmadaEn" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "inscripcionId" TEXT NOT NULL,
    "importeCent" INTEGER NOT NULL,
    "resultado" "ResultadoPago" NOT NULL,
    "referencia" TEXT NOT NULL,
    "fecha" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaAgenda" (
    "id" TEXT NOT NULL,
    "inscripcionId" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "anadidaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "EntradaAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL,
    "inscripcionId" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "registradaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradaPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Congreso_slug_key" ON "Congreso"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AreaTematica_congresoId_nombre_key" ON "AreaTematica"("congresoId", "nombre");

-- CreateIndex
CREATE INDEX "Propuesta_congresoId_estado_idx" ON "Propuesta"("congresoId", "estado");

-- CreateIndex
CREATE INDEX "Propuesta_autorId_idx" ON "Propuesta"("autorId");

-- CreateIndex
CREATE INDEX "Asignacion_evaluadorId_idx" ON "Asignacion"("evaluadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Asignacion_propuestaId_evaluadorId_key" ON "Asignacion"("propuestaId", "evaluadorId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluacion_asignacionId_key" ON "Evaluacion"("asignacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_congresoId_nombre_key" ON "Sala"("congresoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_propuestaId_key" ON "Sesion"("propuestaId");

-- CreateIndex
CREATE INDEX "Sesion_congresoId_inicio_idx" ON "Sesion"("congresoId", "inicio");

-- CreateIndex
CREATE INDEX "Sesion_salaId_inicio_idx" ON "Sesion"("salaId", "inicio");

-- CreateIndex
CREATE UNIQUE INDEX "Tarifa_congresoId_tipoAsistente_key" ON "Tarifa"("congresoId", "tipoAsistente");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_codigoAcreditacion_key" ON "Inscripcion"("codigoAcreditacion");

-- CreateIndex
CREATE INDEX "Inscripcion_congresoId_estado_idx" ON "Inscripcion"("congresoId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Inscripcion_congresoId_usuarioId_key" ON "Inscripcion"("congresoId", "usuarioId");

-- CreateIndex
CREATE INDEX "Pago_inscripcionId_idx" ON "Pago"("inscripcionId");

-- CreateIndex
CREATE INDEX "EntradaAgenda_sesionId_idx" ON "EntradaAgenda"("sesionId");

-- CreateIndex
CREATE UNIQUE INDEX "EntradaAgenda_inscripcionId_sesionId_key" ON "EntradaAgenda"("inscripcionId", "sesionId");

-- CreateIndex
CREATE INDEX "Asistencia_sesionId_idx" ON "Asistencia"("sesionId");

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_inscripcionId_sesionId_key" ON "Asistencia"("inscripcionId", "sesionId");

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaTematica" ADD CONSTRAINT "AreaTematica_congresoId_fkey" FOREIGN KEY ("congresoId") REFERENCES "Congreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_congresoId_fkey" FOREIGN KEY ("congresoId") REFERENCES "Congreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "AreaTematica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_propuestaId_fkey" FOREIGN KEY ("propuestaId") REFERENCES "Propuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "Asignacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_congresoId_fkey" FOREIGN KEY ("congresoId") REFERENCES "Congreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_congresoId_fkey" FOREIGN KEY ("congresoId") REFERENCES "Congreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_propuestaId_fkey" FOREIGN KEY ("propuestaId") REFERENCES "Propuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarifa" ADD CONSTRAINT "Tarifa_congresoId_fkey" FOREIGN KEY ("congresoId") REFERENCES "Congreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_congresoId_fkey" FOREIGN KEY ("congresoId") REFERENCES "Congreso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaAgenda" ADD CONSTRAINT "EntradaAgenda_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaAgenda" ADD CONSTRAINT "EntradaAgenda_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_registradaPorId_fkey" FOREIGN KEY ("registradaPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
