/**
 * Datos de ejemplo (spec 000-core FR-022). Fechas relativas al momento de ejecución para que:
 *  - jornadas-pediatria-2027            → llamada a comunicaciones abierta (HU-01, HU-02, HU-03)
 *  - congreso-innovacion-educativa-2026 → en curso, programa publicado (HU-04, HU-05, HU-06, HU-08)
 *  - simposio-salud-digital-2026        → finalizado (HU-07)
 * Ejecutar: pnpm db:seed  (borra y vuelve a crear todos los datos)
 */
import { PrismaClient, type EstadoPropuesta, type Rol, type TipoAsistente } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { calcularTarifa, diaLocal, finDeDia, inicioDeDia, inicioDelDiaSiguiente, solapa } from "@congresalia/domain";

const db = new PrismaClient();
const PASSWORD = "congreso123";

const MIN = 60_000;
const HORA = 60 * MIN;
const DIA = 24 * HORA;
const ahora = new Date();
/** `ahora` redondeado hacia abajo al cuarto de hora. */
const base = new Date(Math.floor(ahora.getTime() / (15 * MIN)) * 15 * MIN);
/** Medianoche UTC de hoy + días + horas (UTC). */
const dia = (d: number, h = 0, m = 0) => {
  const x = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
  return new Date(x.getTime() + d * DIA + h * HORA + m * MIN);
};

/** Días límite como días completos en la zona del congreso (clarify P1, FR-005a). */
const ZONA = "Europe/Madrid";
const diaRel = (d: number) => diaLocal(new Date(ahora.getTime() + d * DIA), ZONA);
const abre = (d: number) => inicioDeDia(diaRel(d), ZONA);
const cierra = (d: number) => inicioDelDiaSiguiente(diaRel(d), ZONA);
const limite = (d: number) => finDeDia(diaRel(d), ZONA);

async function limpiar() {
  await db.asistencia.deleteMany();
  await db.entradaAgenda.deleteMany();
  await db.pago.deleteMany();
  await db.inscripcion.deleteMany();
  await db.sesion.deleteMany();
  await db.evaluacion.deleteMany();
  await db.asignacion.deleteMany();
  await db.propuesta.deleteMany();
  await db.tarifa.deleteMany();
  await db.sala.deleteMany();
  await db.areaTematica.deleteMany();
  await db.congreso.deleteMany();
  await db.usuarioRol.deleteMany();
  await db.usuario.deleteMany();
}

const hash = await bcrypt.hash(PASSWORD, 10);
async function usuario(email: string, nombre: string, roles: Rol[]) {
  return db.usuario.create({
    data: { email, nombre, passwordHash: hash, roles: { create: roles.map((rol) => ({ rol })) } },
  });
}

const TARIFAS: Record<TipoAsistente, [number, number]> = {
  PROFESIONAL: [25000, 30000],
  SOCIO: [18000, 22000],
  ESTUDIANTE: [9000, 12000],
};

async function congreso(data: {
  slug: string;
  nombre: string;
  descripcion: string;
  sede: string;
  inicio: Date;
  fin: Date;
  envioAbre: Date;
  envioCierra: Date;
  limiteTemprana: Date;
  publicado: boolean;
  areas: string[];
  salas: [string, number][];
}) {
  const c = await db.congreso.create({
    data: {
      slug: data.slug,
      nombre: data.nombre,
      descripcion: data.descripcion,
      sede: data.sede,
      inicio: data.inicio,
      fin: data.fin,
      envioAbre: data.envioAbre,
      envioCierra: data.envioCierra,
      limiteTemprana: data.limiteTemprana,
      estadoPrograma: data.publicado ? "PUBLICADO" : "BORRADOR",
      publicadoEn: data.publicado ? new Date(data.envioCierra.getTime() + 7 * DIA) : null,
      areas: { create: data.areas.map((nombre) => ({ nombre })) },
      salas: { create: data.salas.map(([nombre, aforo]) => ({ nombre, aforo })) },
      tarifas: {
        create: Object.entries(TARIFAS).map(([tipo, [temprano, general]]) => ({
          tipoAsistente: tipo as TipoAsistente,
          importeTempranoCent: temprano,
          importeGeneralCent: general,
        })),
      },
    },
    include: { areas: true, salas: true, tarifas: true },
  });
  const area = (n: string) => c.areas.find((a) => a.nombre === n)!;
  const sala = (n: string) => c.salas.find((s) => s.nombre === n)!;
  return { ...c, area, sala };
}

type Congreso = Awaited<ReturnType<typeof congreso>>;

async function propuesta(
  c: Congreso,
  autorId: string,
  area: string,
  titulo: string,
  estado: EstadoPropuesta,
  enviadaEn: Date,
  evaluaciones: { evaluadorId: string; puntuacion: number; comentarios: string }[] = [],
  asignadosSinEvaluar: string[] = [],
) {
  return db.propuesta.create({
    data: {
      congresoId: c.id,
      areaId: c.area(area).id,
      autorId,
      titulo,
      resumen:
        `${titulo}. ` +
        "Esta comunicación presenta los resultados de un trabajo desarrollado durante los dos últimos cursos, " +
        "describe la metodología empleada, los principales hallazgos y las implicaciones para la práctica profesional, " +
        "y propone líneas de trabajo futuro para su aplicación en otros contextos.",
      estado,
      enviadaEn,
      decididaEn: estado === "ACEPTADA" || estado === "RECHAZADA" ? new Date(enviadaEn.getTime() + 20 * DIA) : null,
      asignaciones: {
        create: [
          ...evaluaciones.map((e) => ({
            evaluadorId: e.evaluadorId,
            evaluacion: { create: { puntuacion: e.puntuacion, comentarios: e.comentarios } },
          })),
          ...asignadosSinEvaluar.map((evaluadorId) => ({ evaluadorId })),
        ],
      },
    },
  });
}

/** Programa sesiones eligiendo, para cada una, un ponente sin solape (regla A7). */
async function programar(
  c: Congreso,
  ponentes: { id: string }[],
  sesiones: { titulo: string; area: string; sala: string; inicio: Date; fin: Date }[],
  evaluadores: string[],
) {
  const ocupacion = new Map<string, { inicio: Date; fin: Date }[]>();
  const creadas = [];
  for (const s of sesiones) {
    const ponente = ponentes.find((p) => !(ocupacion.get(p.id) ?? []).some((o) => solapa(o, s)));
    if (!ponente) throw new Error(`Sin ponente libre para ${s.titulo}`);
    ocupacion.set(ponente.id, [...(ocupacion.get(ponente.id) ?? []), s]);
    const p = await propuesta(
      c,
      ponente.id,
      s.area,
      s.titulo,
      "ACEPTADA",
      new Date(c.envioAbre.getTime() + DIA),
      evaluadores.map((evaluadorId, i) => ({ evaluadorId, puntuacion: 8 + (i % 2), comentarios: "Propuesta sólida y bien argumentada." })),
    );
    creadas.push(
      await db.sesion.create({
        data: { congresoId: c.id, propuestaId: p.id, salaId: c.sala(s.sala).id, inicio: s.inicio, fin: s.fin },
      }),
    );
  }
  return creadas;
}

async function inscribir(
  c: Congreso,
  usuarioId: string,
  tipo: TipoAsistente,
  creadaEn: Date,
  pago: "APROBADO" | "RECHAZADO_Y_PENDIENTE" | "PENDIENTE",
) {
  const t = c.tarifas.find((x) => x.tipoAsistente === tipo)!;
  const { tarifaAplicada, importeCent } = calcularTarifa(t, c.limiteTemprana, creadaEn);
  const confirmada = pago === "APROBADO";
  return db.inscripcion.create({
    data: {
      congresoId: c.id,
      usuarioId,
      tipoAsistente: tipo,
      tarifaAplicada,
      importeCent,
      estado: confirmada ? "CONFIRMADA" : "PENDIENTE_PAGO",
      codigoAcreditacion: confirmada ? randomUUID() : null,
      creadaEn,
      confirmadaEn: confirmada ? new Date(creadaEn.getTime() + 10 * MIN) : null,
      pagos:
        pago === "PENDIENTE"
          ? undefined
          : {
              create: {
                importeCent,
                resultado: confirmada ? "APROBADO" : "RECHAZADO",
                referencia: `SIM-${randomUUID().slice(0, 8).toUpperCase()}`,
                fecha: new Date(creadaEn.getTime() + 10 * MIN),
              },
            },
    },
  });
}

async function main() {
  await limpiar();

  // ── Usuarios (quickstart.md) ──────────────────────────────────────────────
  const organizador = await usuario("organizador@congresalia.es", "Olga Organizadora", ["ORGANIZADOR"]);
  const comite = [
    await usuario("comite1@congresalia.es", "Carmen Comité", ["COMITE"]),
    await usuario("comite2@congresalia.es", "Carlos Comité", ["COMITE"]),
    await usuario("comite3@congresalia.es", "Clara Comité", ["COMITE"]),
  ];
  const ponente1 = await usuario("ponente1@congresalia.es", "Pablo Ponente", ["PONENTE"]);
  const ponente2 = await usuario("ponente2@congresalia.es", "Paula Ponente", ["PONENTE"]);
  const ponenteComite = await usuario("ponente.comite@congresalia.es", "Pedro Ponente-Comité", ["PONENTE", "COMITE"]);
  const otrosPonentes = [];
  for (let i = 3; i <= 8; i++) {
    otrosPonentes.push(await usuario(`ponente${i}@congresalia.es`, `Ponente de ejemplo ${i}`, ["PONENTE"]));
  }
  const asistentes = [];
  for (let i = 1; i <= 5; i++) {
    asistentes.push(await usuario(`asistente${i}@congresalia.es`, `Asistente ${i}`, ["ASISTENTE"]));
  }
  const [a1, a2, a3, a4, a5] = asistentes as [typeof organizador, typeof organizador, typeof organizador, typeof organizador, typeof organizador];
  const acreditacion = await usuario("acreditacion@congresalia.es", "Ángel Acreditación", ["ACREDITACION"]);
  const ponentes = [ponente1, ponente2, ...otrosPonentes];
  const [c1, c2] = [comite[0]!.id, comite[1]!.id];

  // ── Congreso 1: llamada abierta ───────────────────────────────────────────
  const ped = await congreso({
    slug: "jornadas-pediatria-2027",
    nombre: "Jornadas de Pediatría 2027",
    descripcion: "Encuentro anual de profesionales de la pediatría hospitalaria y de atención primaria.",
    sede: "Palacio de Congresos de Valencia",
    envioAbre: abre(-10),
    envioCierra: cierra(30),
    limiteTemprana: limite(60),
    inicio: dia(120, 7),
    fin: dia(122, 16),
    publicado: false,
    areas: ["Pediatría general", "Neonatología", "Nutrición infantil"],
    salas: [["Auditorio", 300], ["Sala A", 80], ["Sala B", 40]],
  });
  const env = (d: number) => dia(-10 + d, 9);
  // ENVIADA (sin evaluadores)
  await propuesta(ped, ponente1.id, "Pediatría general", "Bronquiolitis: actualización del protocolo de urgencias", "ENVIADA", env(1));
  await propuesta(ped, ponente2.id, "Neonatología", "Cuidados centrados en el desarrollo en la UCI neonatal", "ENVIADA", env(2));
  await propuesta(ped, ponenteComite.id, "Nutrición infantil", "Alimentación complementaria guiada por el bebé", "ENVIADA", env(3));
  // EN_EVALUACION con 1 evaluación (no se puede decidir) y otro evaluador pendiente (comite1)
  await propuesta(ped, ponente2.id, "Pediatría general", "Uso racional de antibióticos en otitis media", "EN_EVALUACION", env(2),
    [{ evaluadorId: c2, puntuacion: 7, comentarios: "Buen enfoque, falta concretar la muestra." }], [c1]);
  // EN_EVALUACION con 2 evaluaciones (se puede decidir)
  await propuesta(ped, ponente1.id, "Neonatología", "Método canguro en prematuros extremos", "EN_EVALUACION", env(3), [
    { evaluadorId: c1, puntuacion: 9, comentarios: "Muy relevante y bien documentada." },
    { evaluadorId: c2, puntuacion: 8, comentarios: "Resultados claros; conviene ampliar la discusión." },
  ]);
  // EN_EVALUACION asignada a comite1 sin evaluar
  await propuesta(ped, otrosPonentes[0]!.id, "Nutrición infantil", "Obesidad infantil y entorno escolar", "EN_EVALUACION", env(4), [], [c1, comite[2]!.id]);
  // ACEPTADAS sin programar (HU-03): dos de ponente1 para demostrar el solape de ponente
  for (const [autor, area, titulo] of [
    [ponente1.id, "Pediatría general", "Vacunación en la adolescencia: retos actuales"],
    [ponente1.id, "Nutrición infantil", "Alergias alimentarias: diagnóstico precoz"],
    [ponente2.id, "Neonatología", "Lactancia materna en el recién nacido prematuro"],
    [otrosPonentes[1]!.id, "Pediatría general", "Salud mental infanto-juvenil tras la pandemia"],
  ] as const) {
    await propuesta(ped, autor, area, titulo, "ACEPTADA", env(1), [
      { evaluadorId: c1, puntuacion: 9, comentarios: "Excelente propuesta." },
      { evaluadorId: c2, puntuacion: 8, comentarios: "Aceptar." },
    ]);
  }
  // RECHAZADA
  await propuesta(ped, ponente2.id, "Pediatría general", "Revisión narrativa sobre fiebre", "RECHAZADA", env(1), [
    { evaluadorId: c1, puntuacion: 3, comentarios: "Poco novedosa." },
    { evaluadorId: c2, puntuacion: 4, comentarios: "Metodología insuficiente." },
  ]);

  // ── Congreso 2: en curso ──────────────────────────────────────────────────
  const edu = await congreso({
    slug: "congreso-innovacion-educativa-2026",
    nombre: "Congreso de Innovación Educativa 2026",
    descripcion: "Congreso de referencia sobre metodologías activas, evaluación y tecnología educativa.",
    sede: "Auditorio de la Universidad de Alicante",
    envioAbre: abre(-120),
    envioCierra: cierra(-60),
    limiteTemprana: limite(-30),
    inicio: dia(-1, 6),
    fin: dia(2, 18),
    publicado: true,
    areas: ["Metodologías activas", "Evaluación", "Tecnología educativa"],
    salas: [["Auditorio", 200], ["Sala Magna", 60], ["Aula 3", 2]],
  });
  const t = (offsetMin: number) => new Date(base.getTime() + offsetMin * MIN);
  const sesEdu = await programar(
    edu,
    ponentes,
    [
      // En marcha ahora (escaneo HU-06)
      { titulo: "Aprendizaje basado en proyectos en secundaria", area: "Metodologías activas", sala: "Auditorio", inicio: t(-30), fin: t(60) },
      { titulo: "Rúbricas compartidas entre departamentos", area: "Evaluación", sala: "Aula 3", inicio: t(-15), fin: t(45) },
      { titulo: "Inteligencia artificial en el aula: guía práctica", area: "Tecnología educativa", sala: "Sala Magna", inicio: t(0), fin: t(60) },
      // Próximas (agenda HU-05); la 4 y la 5 se solapan entre sí
      { titulo: "Gamificación con recursos abiertos", area: "Metodologías activas", sala: "Auditorio", inicio: t(120), fin: t(180) },
      { titulo: "Evaluación formativa con portafolios", area: "Evaluación", sala: "Sala Magna", inicio: t(150), fin: t(210) },
      { titulo: "Aula invertida: lecciones aprendidas", area: "Metodologías activas", sala: "Auditorio", inicio: t(180), fin: t(240) },
      { titulo: "Competencia digital docente", area: "Tecnología educativa", sala: "Aula 3", inicio: t(24 * 60), fin: t(24 * 60 + 60) },
      { titulo: "Coevaluación entre iguales", area: "Evaluación", sala: "Sala Magna", inicio: t(24 * 60), fin: t(24 * 60 + 90) },
      // Pasada
      { titulo: "Conferencia inaugural: la escuela que viene", area: "Metodologías activas", sala: "Auditorio", inicio: dia(-1, 8), fin: dia(-1, 9) },
    ],
    [c1, c2],
  );
  const [sAhoraAud, sAula3, , sProx1, , sProx3, sManana] = sesEdu as [typeof sesEdu[0], typeof sesEdu[0], typeof sesEdu[0], typeof sesEdu[0], typeof sesEdu[0], typeof sesEdu[0], typeof sesEdu[0]];
  const tempr = dia(-45);
  const general = dia(-10);
  const i1 = await inscribir(edu, a1.id, "PROFESIONAL", tempr, "APROBADO");
  const i2 = await inscribir(edu, a2.id, "ESTUDIANTE", general, "APROBADO");
  await inscribir(edu, a3.id, "SOCIO", tempr, "APROBADO");
  await inscribir(edu, a4.id, "ESTUDIANTE", general, "RECHAZADO_Y_PENDIENTE");
  // asistente5 sin inscripción en este congreso (para inscribirse en la demo de HU-04)
  // Inscripciones de relleno para que el panel (HU-08) tenga volumen
  const tipos: TipoAsistente[] = ["PROFESIONAL", "SOCIO", "ESTUDIANTE"];
  for (let i = 1; i <= 36; i++) {
    const u = await usuario(`demo${String(i).padStart(2, "0")}@congresalia.es`, `Asistente demo ${i}`, ["ASISTENTE"]);
    await inscribir(edu, u.id, tipos[i % 3]!, i % 2 ? tempr : general, i % 9 === 0 ? "PENDIENTE" : "APROBADO");
  }
  // Agendas: Aula 3 (aforo 2) completa con asistente1 y asistente2
  for (const s of [sAhoraAud, sAula3, sProx1, sProx3, sManana]) await db.entradaAgenda.create({ data: { inscripcionId: i1.id, sesionId: s.id } });
  for (const s of [sAula3, sProx1]) await db.entradaAgenda.create({ data: { inscripcionId: i2.id, sesionId: s.id } });
  // Asistencias: Aula 3 ya llena en la puerta; Auditorio con un asistente de relleno (asistente1 ya está en Aula 3
  // a esa hora y no puede estar en dos sesiones solapadas: spec-006 FR-011, converge-2 F2)
  const d1 = await db.inscripcion.findFirstOrThrow({ where: { congresoId: edu.id, usuario: { email: "demo01@congresalia.es" } } });
  for (const [insc, s] of [[i1, sAula3], [i2, sAula3], [d1, sAhoraAud]] as const) {
    await db.asistencia.create({ data: { inscripcionId: insc.id, sesionId: s.id, registradaPorId: acreditacion.id, registradaEn: t(-10) } });
  }

  // ── Congreso 3: finalizado ────────────────────────────────────────────────
  const sal = await congreso({
    slug: "simposio-salud-digital-2026",
    nombre: "Simposio de Salud Digital 2026",
    descripcion: "Simposio sobre telemedicina, historia clínica electrónica y salud móvil.",
    sede: "Hotel Meliá Sevilla",
    envioAbre: abre(-150),
    envioCierra: cierra(-90),
    limiteTemprana: limite(-50),
    inicio: dia(-20, 7),
    fin: dia(-19, 17),
    publicado: true,
    areas: ["Telemedicina", "Datos de salud"],
    salas: [["Sala Giralda", 120], ["Sala Triana", 60]],
  });
  const sesSal = await programar(
    sal,
    ponentes,
    [
      { titulo: "Teleconsulta en atención primaria", area: "Telemedicina", sala: "Sala Giralda", inicio: dia(-20, 8), fin: dia(-20, 9, 30) },
      { titulo: "Interoperabilidad con HL7 FHIR", area: "Datos de salud", sala: "Sala Giralda", inicio: dia(-20, 10), fin: dia(-20, 11) },
      { titulo: "Monitorización remota de pacientes crónicos", area: "Telemedicina", sala: "Sala Triana", inicio: dia(-20, 12), fin: dia(-20, 13) },
      { titulo: "Protección de datos en salud móvil", area: "Datos de salud", sala: "Sala Giralda", inicio: dia(-19, 8), fin: dia(-19, 9) },
      { titulo: "Evaluación de apps de salud", area: "Datos de salud", sala: "Sala Triana", inicio: dia(-19, 10), fin: dia(-19, 11, 30) },
    ],
    [c1, c2],
  );
  const j1 = await inscribir(sal, a1.id, "PROFESIONAL", dia(-60), "APROBADO");
  const j2 = await inscribir(sal, a2.id, "ESTUDIANTE", dia(-40), "APROBADO");
  await inscribir(sal, a3.id, "SOCIO", dia(-40), "APROBADO"); // agenda vacía
  for (const s of sesSal) {
    await db.entradaAgenda.create({ data: { inscripcionId: j1.id, sesionId: s.id } });
    await db.entradaAgenda.create({ data: { inscripcionId: j2.id, sesionId: s.id } });
  }
  // asistente1: 4 de 5 (80 %) · asistente2: 3 de 5 (60 %)
  for (const [insc, n] of [[j1, 4], [j2, 3]] as const) {
    for (const s of sesSal.slice(0, n)) {
      await db.asistencia.create({ data: { inscripcionId: insc.id, sesionId: s.id, registradaPorId: acreditacion.id, registradaEn: s.inicio } });
    }
  }

  void organizador;
  void a5;
  const total = await db.usuario.count();
  console.log(`✔ Seed completado: ${total} usuarios, 3 congresos. Contraseña de todos: ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
