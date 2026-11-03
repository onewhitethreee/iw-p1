import { ETIQUETA_FASE, type FaseCongreso } from "@congresalia/domain";
import { Badge } from "~/components/ui/badge";

const VARIANTE = { LLAMADA_ABIERTA: "success", EN_PREPARACION: "secondary", EN_CURSO: "warning", FINALIZADO: "outline" } as const;

export function FaseBadge({ fase }: { fase: FaseCongreso }) {
  return <Badge variant={VARIANTE[fase]}>{ETIQUETA_FASE[fase]}</Badge>;
}
