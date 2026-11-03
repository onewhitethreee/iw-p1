import type { Rol } from "@prisma/client";

export const ETIQUETA_ROL: Record<Rol, string> = {
  ORGANIZADOR: "Organización",
  COMITE: "Comité científico",
  PONENTE: "Ponente",
  ASISTENTE: "Asistente",
  ACREDITACION: "Acreditación",
};

/** Zona privada de cada rol (rutas del plan de 000-core). */
export const ZONA_ROL: Record<Rol, { href: string; texto: string }> = {
  ORGANIZADOR: { href: "/organizador", texto: "Organización" },
  COMITE: { href: "/comite", texto: "Mis evaluaciones" },
  PONENTE: { href: "/ponente", texto: "Mis propuestas" },
  ASISTENTE: { href: "/area-personal", texto: "Área personal" },
  ACREDITACION: { href: "/acreditacion", texto: "Acreditación" },
};
