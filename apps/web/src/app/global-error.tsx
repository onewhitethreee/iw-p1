"use client";

/** Error en el layout raíz: página mínima autónoma en español (T042). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100dvh", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: 16 }}>
          <h1 style={{ fontSize: 24 }}>Algo ha ido mal</h1>
          <p style={{ color: "#555" }}>Congresalia no está disponible en este momento. Inténtalo de nuevo dentro de un momento.</p>
          <button onClick={reset} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
