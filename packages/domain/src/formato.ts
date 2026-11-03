const fmtEuros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" });

/** Formatea céntimos como euros en formato español: 125000 → «1.250,00 €». */
export function euros(cent: number): string {
  return fmtEuros.format(cent / 100);
}

export function fecha(d: Date, zona: string): string {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: zona }).format(d);
}

export function hora(d: Date, zona: string): string {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: zona }).format(d);
}

export function fechaHora(d: Date, zona: string): string {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: zona }).format(d);
}

export function diaSemana(d: Date, zona: string): string {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: zona }).format(d);
}
