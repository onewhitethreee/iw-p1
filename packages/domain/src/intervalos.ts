/** Intervalo semiabierto [inicio, fin). Acuerdo A7. */
export interface Intervalo {
  inicio: Date;
  fin: Date;
}

/** Dos intervalos se solapan si inicioA < finB y inicioB < finA (los contiguos no se solapan). */
export function solapa(a: Intervalo, b: Intervalo): boolean {
  return a.inicio.getTime() < b.fin.getTime() && b.inicio.getTime() < a.fin.getTime();
}

/** Devuelve el primer elemento de `otros` que se solapa con `nuevo`, o undefined. */
export function primerSolape<T extends Intervalo>(nuevo: Intervalo, otros: readonly T[]): T | undefined {
  return otros.find((o) => solapa(nuevo, o));
}

export function intervaloValido(i: Intervalo): boolean {
  return i.inicio.getTime() < i.fin.getTime();
}

const aMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const aHora = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/**
 * spec-003 SC-004 (converge-3): primer hueco libre de `duracion` minutos en una sala un día, desde `desde`,
 * dadas sus sesiones en horas locales «HH:mm». Contiguas no se solapan (A7). Sin cruzar la medianoche
 * (clarify-2 P3 de spec-003) → `null` si no cabe. Solo propone la hora; el servidor sigue validando todo.
 */
export function primerHueco(ocupadas: readonly { inicio: string; fin: string }[], desde = "09:00", duracion = 60): { horaInicio: string; horaFin: string } | null {
  let inicio = aMin(desde);
  for (const o of [...ocupadas].sort((a, b) => aMin(a.inicio) - aMin(b.inicio))) {
    if (inicio + duracion <= aMin(o.inicio)) break;
    inicio = Math.max(inicio, aMin(o.fin));
  }
  return inicio + duracion < 24 * 60 ? { horaInicio: aHora(inicio), horaFin: aHora(inicio + duracion) } : null;
}
