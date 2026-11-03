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
