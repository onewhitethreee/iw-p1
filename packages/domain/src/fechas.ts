/**
 * Días completos en la zona horaria del congreso (clarify P1, 000-core FR-005a).
 * Un «día» es una cadena `AAAA-MM-DD` interpretada en la zona IANA indicada.
 */

const RE_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Desfase (ms) de la zona respecto a UTC en el instante `t`. */
function desfase(t: number, zona: string): number {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(t));
  const v = (tipo: string) => Number(p.find((x) => x.type === tipo)!.value);
  const comoUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  return comoUtc - Math.floor(t / 1000) * 1000;
}

/** Instante UTC correspondiente a la medianoche local del día indicado. */
export function inicioDeDia(dia: string, zona: string): Date {
  const m = RE_DIA.exec(dia);
  if (!m) throw new Error(`Día no válido: ${dia} (formato AAAA-MM-DD)`);
  const local = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Dos pasadas para acertar también en los días de cambio de hora
  let t = local - desfase(local, zona);
  t = local - desfase(t, zona);
  return new Date(t);
}

/** Medianoche local del día siguiente: límite exclusivo de un plazo que incluye el día completo. */
export function inicioDelDiaSiguiente(dia: string, zona: string): Date {
  const m = RE_DIA.exec(dia);
  if (!m) throw new Error(`Día no válido: ${dia} (formato AAAA-MM-DD)`);
  const sig = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1));
  return inicioDeDia(sig.toISOString().slice(0, 10), zona);
}

/** Último milisegundo (23:59:59.999) del día en la zona: límite inclusivo. */
export function finDeDia(dia: string, zona: string): Date {
  return new Date(inicioDelDiaSiguiente(dia, zona).getTime() - 1);
}

/** Día del calendario (`AAAA-MM-DD`) de un instante en la zona indicada. */
export function diaLocal(d: Date, zona: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

const RE_FECHA_HORA = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Instante UTC de una fecha y hora locales «AAAA-MM-DDTHH:mm» en la zona indicada
 * (spec-003 clarify P2: las horas del programa se introducen en la zona del congreso).
 */
export function instanteLocal(fechaHora: string, zona: string): Date {
  const m = RE_FECHA_HORA.exec(fechaHora);
  if (!m) throw new Error(`Fecha y hora no válidas: ${fechaHora} (formato AAAA-MM-DDTHH:mm)`);
  const [, dia, hh, mm] = m as unknown as [string, string, string, string];
  const local = Date.UTC(Number(dia.slice(0, 4)), Number(dia.slice(5, 7)) - 1, Number(dia.slice(8, 10)), Number(hh), Number(mm));
  // Dos pasadas, igual que inicioDeDia, para acertar también en los días de cambio de hora
  let t = local - desfase(local, zona);
  t = local - desfase(t, zona);
  return new Date(t);
}
