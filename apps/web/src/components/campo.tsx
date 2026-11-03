import { Label } from "~/components/ui/label";

/** Etiqueta + control + error accesible. */
export function Campo({ id, label, error, ayuda, children }: { id: string; label: string; error?: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {ayuda && !error && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
