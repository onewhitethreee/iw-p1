-- spec-001 clarify-2 P4 / FR-011 (plan decisión 6, research R6): un autor no repite título en un congreso.
-- Se compara sin mayúsculas/minúsculas ni espacios al principio o al final. Prisma no expresa índices sobre
-- expresiones en schema.prisma (igual que los CHECK de 20261103160000), así que se mantiene en SQL.
CREATE UNIQUE INDEX "Propuesta_autor_congreso_titulo_key"
  ON "Propuesta" ("autorId", "congresoId", lower(btrim("titulo")));
