import type { MetadataRoute } from "next";
import { URL_BASE } from "~/lib/seo";

/** spec-003 FR-009: indexar lo público, no las zonas privadas ni la API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/organizador", "/comite", "/ponente", "/area-personal", "/acreditacion", "/api", "/entrar", "/registro"] },
    sitemap: `${URL_BASE}/sitemap.xml`,
  };
}
