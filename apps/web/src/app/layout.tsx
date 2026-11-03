import type { Metadata } from "next";
import "./globals.css";
import { Cabecera } from "~/components/cabecera";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.AUTH_URL ?? "http://localhost:3000"),
  title: { default: "Congresalia · Congresos profesionales y científicos", template: "%s · Congresalia" },
  description: "Congresos de salud y educación: llamada a comunicaciones, programa, inscripción y acreditación.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh">
        <TRPCReactProvider>
          <Cabecera />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
