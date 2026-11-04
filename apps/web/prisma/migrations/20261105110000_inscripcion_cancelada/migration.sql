-- spec-004 clarify-2 P4 / FR-014 (plan decisión 8, research R7): el titular puede cancelar una inscripción pendiente.
-- Al volver a inscribirse se reutiliza la misma fila (CANCELADA → PENDIENTE_PAGO); la restricción única no cambia.
ALTER TYPE "EstadoInscripcion" ADD VALUE 'CANCELADA';
