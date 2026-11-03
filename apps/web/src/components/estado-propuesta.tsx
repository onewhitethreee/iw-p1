import { ETIQUETA_ESTADO_PROPUESTA, type EstadoPropuesta } from "@congresalia/domain";
import { Badge } from "~/components/ui/badge";

const VARIANTE: Record<EstadoPropuesta, "secondary" | "warning" | "success" | "destructive"> = {
  ENVIADA: "secondary",
  EN_EVALUACION: "warning",
  ACEPTADA: "success",
  RECHAZADA: "destructive",
};

export function EstadoPropuestaBadge({ estado }: { estado: EstadoPropuesta }) {
  return <Badge variant={VARIANTE[estado]}>{ETIQUETA_ESTADO_PROPUESTA[estado]}</Badge>;
}
