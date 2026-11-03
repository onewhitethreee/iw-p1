import { api } from "~/trpc/server";

// Página índice provisional: cada spec (001–008) añade aquí su funcionalidad.
export default async function Page() {
  const congresos = await (await api()).congreso.listar();
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-semibold">Acreditación</h1>
      <p className="text-muted-foreground">Elige un congreso. Las funcionalidades de esta zona se añaden en las specs 001–008.</p>
      <ul className="list-inside list-disc">
        {congresos.map((c) => (
          <li key={c.id}>{c.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
