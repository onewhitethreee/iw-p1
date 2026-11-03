-- Converge F2 / T043: invariantes de specs/000-core/data-model.md garantizadas por la base de datos.
-- (Prisma no expresa CHECK en schema.prisma; se mantienen en esta migración SQL.)

ALTER TABLE "Congreso" ADD CONSTRAINT "Congreso_fechas_check" CHECK (
  "inicio" < "fin"
  AND "envioAbre" < "envioCierra"
  AND "envioCierra" <= "inicio"
  AND "limiteTemprana" <= "inicio"
);

ALTER TABLE "Sala" ADD CONSTRAINT "Sala_aforo_check" CHECK ("aforo" > 0);

ALTER TABLE "Tarifa" ADD CONSTRAINT "Tarifa_importes_check" CHECK (
  "importeTempranoCent" >= 0 AND "importeGeneralCent" >= "importeTempranoCent"
);

ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_puntuacion_check" CHECK ("puntuacion" BETWEEN 1 AND 10);
