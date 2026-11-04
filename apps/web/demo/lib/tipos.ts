import type { Page } from "@playwright/test";
import type { Escena } from "./escena";

export interface Herramientas {
  /** Otra ventana del navegador, con su propia sesión, que no se graba (otro usuario a la vez). */
  nuevaVentana: () => Promise<Page>;
}

export interface Historia {
  id: string; // nombre del vídeo: hu00 … hu08
  hu: string; // "HU-01"
  titulo: string;
  /** Se ejecuta tras el seed y antes de abrir el navegador (p. ej. preparar la cámara simulada). */
  preparar?: () => Promise<{ args?: string[] }>;
  guion: (e: Escena, h: Herramientas) => Promise<void>;
}
