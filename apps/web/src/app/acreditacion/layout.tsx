import { comprobarRol } from "~/server/guards";

export const metadata = { robots: { index: false } };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const denegado = await comprobarRol("/acreditacion", "ACREDITACION");
  return denegado ?? children;
}
