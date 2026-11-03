/** spec-003 R5: datos estructurados schema.org para buscadores. */
export const URL_BASE = process.env.AUTH_URL ?? "http://localhost:3000";

interface SesionSeo {
  id: string;
  titulo: string;
  inicio: Date;
  fin: Date;
  sala: string;
  ponente: string;
}

export function jsonLdSesion(congreso: { slug: string; sede: string }, s: SesionSeo) {
  return {
    "@type": "Event",
    name: s.titulo,
    startDate: s.inicio.toISOString(),
    endDate: s.fin.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: `${s.sala} · ${congreso.sede}`, address: congreso.sede },
    performer: { "@type": "Person", name: s.ponente },
    url: `${URL_BASE}/congresos/${congreso.slug}/programa/${s.id}`,
  };
}

export function jsonLdCongreso(
  c: { slug: string; nombre: string; descripcion: string; sede: string; inicio: Date; fin: Date },
  sesiones: SesionSeo[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: c.nombre,
    description: c.descripcion,
    startDate: c.inicio.toISOString(),
    endDate: c.fin.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: c.sede, address: c.sede },
    organizer: { "@type": "Organization", name: "Congresalia", url: URL_BASE },
    url: `${URL_BASE}/congresos/${c.slug}/programa`,
    subEvent: sesiones.map((s) => jsonLdSesion(c, s)),
  };
}

/** Inserta JSON-LD de forma segura (escapa «<» para evitar cerrar el <script>). */
export function scriptJsonLd(datos: object) {
  return { __html: JSON.stringify(datos).replace(/</g, "\\u003c") };
}
