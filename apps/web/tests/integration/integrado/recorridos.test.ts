/**
 * Recorridos completos de la memoria §5.4: encadenan historias de distintos bloques del reparto
 * (HU-04 → HU-05 → HU-06 → HU-07 → HU-08) llamando a la API real como lo haría la interfaz.
 * El reloj se simula con `ahora` para recorrer el congreso de principio a fin.
 */
import { describe, expect, it } from "vitest";
import { db } from "~/server/db";
import { crearCaller, crearUsuario } from "../helpers";

const MIN = 60_000;
const BASE = new Date("2027-05-10T08:00:00Z"); // 10:00 en Madrid, primer día del congreso
const min = (m: number) => new Date(BASE.getTime() + m * MIN);
const DIA = 24 * 60;
const ANTES = min(-10 * DIA); // inscripción y agenda, 10 días antes
const DESPUES = min(3 * DIA); // congreso ya terminado
const TARJETA_OK = "4111 1111 1111 1111";

/** Precondición común: congreso con programa publicado, tarifas y las salas indicadas. */
async function congreso(
  salas: { nombre: string; aforo: number }[],
  sesiones: { sala: number; ini: number; dur: number }[],
  estadoPrograma: "BORRADOR" | "PUBLICADO" = "PUBLICADO",
) {
  const c = await db.congreso.create({
    data: {
      slug: `recorrido-${Date.now()}-${Math.random()}`,
      nombre: "Congreso recorrido",
      descripcion: "x",
      sede: "Sede",
      zonaHoraria: "Europe/Madrid",
      envioAbre: min(-90 * DIA),
      envioCierra: min(-60 * DIA),
      limiteTemprana: min(-30 * DIA), // ya pasó: se aplica la tarifa general
      inicio: min(0),
      fin: min(2 * DIA),
      estadoPrograma,
      areas: { create: [{ nombre: "Salud digital" }] },
      salas: { create: salas },
      tarifas: { create: [{ tipoAsistente: "PROFESIONAL", importeTempranoCent: 15000, importeGeneralCent: 20000 }] },
    },
    include: { areas: true, salas: { orderBy: { aforo: "asc" } } },
  });
  const autor = await crearUsuario(["PONENTE"], "Ponente");
  const ses = [];
  for (const [i, s] of sesiones.entries()) {
    const p = await db.propuesta.create({
      data: { congresoId: c.id, areaId: c.areas[0]!.id, autorId: autor.id, titulo: `Sesión ${i + 1}`, resumen: "r".repeat(120), estado: "ACEPTADA" },
    });
    ses.push(await db.sesion.create({ data: { congresoId: c.id, propuestaId: p.id, salaId: c.salas[s.sala]!.id, inicio: min(s.ini), fin: min(s.ini + s.dur) } }));
  }
  return { c, ses, salas: c.salas };
}

/** HU-04: inscribirse y pagar con la pasarela simulada; devuelve la inscripción confirmada. */
async function inscribirYPagar(congresoId: string, nombre: string) {
  const u = await crearUsuario(["ASISTENTE"], nombre);
  const api = await crearCaller(u.id, ANTES);
  const ins = await api.inscripcion.crear({ congresoId, tipoAsistente: "PROFESIONAL" });
  const pago = await api.inscripcion.pagar({ inscripcionId: ins.id, tarjeta: TARJETA_OK });
  const fila = await db.inscripcion.findUniqueOrThrow({ where: { id: ins.id } });
  return { u, ins, pago, codigo: fila.codigoAcreditacion!, estado: fila.estado };
}

describe("Recorridos completos entre historias (memoria §5.4)", () => {
  it("RC-1 satisfactorio: inscripción → agenda → acceso QR → certificado → panel", async () => {
    // Precondición: 5 sesiones de 60 min, separadas 2 h, en una sala de 100 plazas
    const { c, ses } = await congreso(
      [{ nombre: "Auditorio", aforo: 100 }],
      [0, 120, 240, 360, 480].map((ini) => ({ sala: 0, ini, dur: 60 })),
    );
    const org = await crearUsuario(["ORGANIZADOR"], "Organizadora");
    const puerta = await crearUsuario(["ACREDITACION"], "Puerta");

    // 1. HU-04: tarifa general (pasó la fecha temprana) y confirmación al pagar
    const lucia = await inscribirYPagar(c.id, "Lucía");
    expect(lucia.ins).toMatchObject({ tarifaAplicada: "GENERAL", importeCent: 20000 });
    expect(lucia.pago.resultado).toBe("APROBADO");
    expect(lucia.estado).toBe("CONFIRMADA");

    // 2. HU-05: añade las 5 sesiones a su agenda
    const agenda = await crearCaller(lucia.u.id, ANTES);
    for (const s of ses) expect(await agenda.agenda.anadir({ sesionId: s.id })).toEqual({ ok: true });

    // 3. HU-06: la puerta la admite en 4 de las 5 sesiones (en el momento de inicio de cada una)
    for (const s of ses.slice(0, 4)) {
      const api = await crearCaller(puerta.id, s.inicio);
      expect(await api.acreditacion.escanear({ sesionId: s.id, codigo: lucia.codigo })).toMatchObject({ resultado: "ADMITIDO", asistente: "Lucía" });
    }

    // 4. HU-07: tras el congreso, 4 de 5 = 80 % → certificado disponible
    const cert = await (await crearCaller(lucia.u.id, DESPUES)).certificado.estado({ congresoId: c.id });
    expect(cert).toMatchObject({ estado: "DISPONIBLE", disponible: true, porcentaje: 80, asistidas: 4, total: 5 });

    // 5. HU-08: el panel refleja la inscripción, el ingreso y la ocupación
    const panel = await (await crearCaller(org.id, min(30))).panel.resumen({ congresoId: c.id });
    expect(panel.inscripciones).toEqual({ confirmadas: 1, pendientes: 0 });
    expect(panel.ingresosCent).toBe(20000);
    expect(panel.desglose.find((d) => d.tipoAsistente === "PROFESIONAL" && d.tarifa === "GENERAL")).toMatchObject({ confirmadas: 1, ingresosCent: 20000 });
    expect(panel.sesiones[0]).toMatchObject({ reservas: 1, asistencias: 1, aforo: 100 });
  });

  it("RC-3 de la propuesta al programa: envío en plazo → evaluación anónima (≥ 2) → programa sin choques → agenda", async () => {
    // Precondición: congreso con el plazo de envío abierto (de -90 a -60 días), programa en borrador y dos salas
    const { c, salas } = await congreso(
      [
        { nombre: "Sala A", aforo: 40 },
        { nombre: "Sala B", aforo: 60 },
      ],
      [],
      "BORRADOR",
    );
    const area = c.areas[0]!.id;
    const pedro = await crearUsuario(["PONENTE"], "Pedro Ponente");
    const org = await crearUsuario(["ORGANIZADOR"], "Organizadora");
    const [eva1, eva2] = [await crearUsuario(["COMITE"], "Evaluadora 1"), await crearUsuario(["COMITE"], "Evaluador 2")];
    const EN_PLAZO = min(-75 * DIA);
    const resumen = "Resumen de la ponencia con la extensión mínima exigida por el formulario de envío. ".repeat(2);

    // 1. HU-01: Pedro envía dos propuestas en plazo; un tercer envío tras el cierre se rechaza
    const ponente = await crearCaller(pedro.id, EN_PLAZO);
    const pa = await ponente.propuesta.enviar({ congresoId: c.id, areaId: area, titulo: "Telemedicina rural", resumen });
    const pb = await ponente.propuesta.enviar({ congresoId: c.id, areaId: area, titulo: "Historia clínica digital", resumen });
    expect(await db.propuesta.count({ where: { congresoId: c.id, estado: "ENVIADA" } })).toBe(2);
    await expect(
      (await crearCaller(pedro.id, min(-50 * DIA))).propuesta.enviar({ congresoId: c.id, areaId: area, titulo: "Fuera de plazo", resumen }),
    ).rejects.toMatchObject({ code: "CONFLICT", message: "El plazo de envío de propuestas de este congreso está cerrado" });

    // 2. HU-02: dos evaluadores por propuesta; el comité no ve al autor; no se decide con una sola evaluación
    const organizadora = await crearCaller(org.id, min(-55 * DIA));
    for (const p of [pa, pb]) for (const e of [eva1, eva2]) await organizadora.evaluacion.asignar({ propuestaId: p.id, evaluadorId: e.id });
    const comite1 = await crearCaller(eva1.id, min(-55 * DIA));
    const asignadas = await comite1.evaluacion.misAsignaciones({ congresoId: c.id });
    expect(asignadas).toHaveLength(2);
    expect(JSON.stringify(asignadas)).not.toContain("Pedro"); // revisión anónima
    const asignacionDe = async (evaluadorId: string, propuestaId: string) =>
      (await db.asignacion.findFirstOrThrow({ where: { evaluadorId, propuestaId } })).id;

    await comite1.evaluacion.evaluar({ asignacionId: await asignacionDe(eva1.id, pa.id), puntuacion: 8, comentarios: "Buen enfoque aplicado." });
    await expect(organizadora.evaluacion.decidir({ propuestaId: pa.id, decision: "ACEPTAR" })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Se necesitan al menos 2 evaluaciones (tiene 1)",
    });
    const comite2 = await crearCaller(eva2.id, min(-55 * DIA));
    await comite2.evaluacion.evaluar({ asignacionId: await asignacionDe(eva2.id, pa.id), puntuacion: 9, comentarios: "Muy pertinente." });
    await comite1.evaluacion.evaluar({ asignacionId: await asignacionDe(eva1.id, pb.id), puntuacion: 7, comentarios: "Correcta y clara." });
    await comite2.evaluacion.evaluar({ asignacionId: await asignacionDe(eva2.id, pb.id), puntuacion: 7, comentarios: "Interesante caso." });
    for (const p of [pa, pb]) expect(await organizadora.evaluacion.decidir({ propuestaId: p.id, decision: "ACEPTAR" })).toEqual({ estado: "ACEPTADA" });

    // 3. HU-03: se programa A; B a la misma hora en otra sala choca por el ponente; a las 11:00 entra
    const sa = await organizadora.programa.programar({ propuestaId: pa.id, salaId: salas[0]!.id, dia: "2027-05-10", horaInicio: "10:00", horaFin: "11:00" });
    await expect(
      organizadora.programa.programar({ propuestaId: pb.id, salaId: salas[1]!.id, dia: "2027-05-10", horaInicio: "10:30", horaFin: "11:30" }),
    ).rejects.toMatchObject({ code: "CONFLICT", message: "Pedro Ponente ya tiene la sesión «Telemedicina rural» de 10:00 a 11:00" });
    await organizadora.programa.programar({ propuestaId: pb.id, salaId: salas[1]!.id, dia: "2027-05-10", horaInicio: "11:00", horaFin: "12:00" });

    //    El programa en borrador no es público; tras publicarlo se ven las dos ponencias
    const anonimo = await crearCaller(null, min(-40 * DIA));
    expect(await anonimo.programa.publico({ slug: c.slug })).toMatchObject({ publicado: false });
    await organizadora.programa.publicar({ congresoId: c.id });
    const publico = await anonimo.programa.publico({ slug: c.slug });
    expect(publico.publicado && publico.dias[0]!.sesiones.map((s) => [s.titulo, s.sala, s.ponente])).toEqual([
      ["Telemedicina rural", "Sala A", "Pedro Ponente"],
      ["Historia clínica digital", "Sala B", "Pedro Ponente"],
    ]);

    // 4. HU-04 + HU-05: un asistente confirmado añade a su agenda las dos ponencias seguidas (no se solapan, A7)
    const marta = await inscribirYPagar(c.id, "Marta");
    const agenda = await crearCaller(marta.u.id, ANTES);
    expect(await agenda.agenda.anadir({ sesionId: sa.id })).toEqual({ ok: true });
    const sb = await db.sesion.findUniqueOrThrow({ where: { propuestaId: pb.id } });
    expect(await agenda.agenda.anadir({ sesionId: sb.id })).toEqual({ ok: true });
  });

  it("RC-2 error, permiso y estado: aforo reservado → cambio de sala en el panel → nueva reserva y acceso", async () => {
    // Precondición: sesión de 60 min en una sala de 1 plaza; existe otra sala de 50 libre
    const { c, ses, salas } = await congreso(
      [
        { nombre: "Seminario", aforo: 1 },
        { nombre: "Auditorio", aforo: 50 },
      ],
      [{ sala: 0, ini: 0, dur: 60 }],
    );
    const sesion = ses[0]!;
    const org = await crearUsuario(["ORGANIZADOR"], "Organizadora");
    const puerta = await crearUsuario(["ACREDITACION"], "Puerta");
    const ana = await inscribirYPagar(c.id, "Ana");
    const blas = await inscribirYPagar(c.id, "Blas");

    // 1. HU-05: Ana reserva la única plaza; Blas recibe «Aforo completo» y no se crea la reserva
    await (await crearCaller(ana.u.id, ANTES)).agenda.anadir({ sesionId: sesion.id });
    await expect((await crearCaller(blas.u.id, ANTES)).agenda.anadir({ sesionId: sesion.id })).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Aforo completo",
    });
    expect(await db.entradaAgenda.count({ where: { sesionId: sesion.id } })).toBe(1);

    // 2. HU-06: en la puerta, Blas (sin reserva) no puede ocupar la plaza reservada por Ana
    expect(await (await crearCaller(puerta.id, min(0))).acreditacion.escanear({ sesionId: sesion.id, codigo: blas.codigo })).toMatchObject({
      resultado: "RECHAZADO",
      motivo: "No quedan plazas sin reservar",
    });

    // 3. HU-08 permisos: un asistente no puede cambiar la sala desde el panel
    await expect((await crearCaller(ana.u.id, ANTES)).panel.cambiarSala({ sesionId: sesion.id, salaId: salas[1]!.id })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });

    // 4. HU-08: la organizadora la pasa al Auditorio antes de empezar
    expect(await (await crearCaller(org.id, ANTES)).panel.cambiarSala({ sesionId: sesion.id, salaId: salas[1]!.id })).toMatchObject({
      sala: "Auditorio",
      aforo: 50,
    });

    // 5. HU-05 + HU-06: ahora Blas reserva y entra
    expect(await (await crearCaller(blas.u.id, ANTES)).agenda.anadir({ sesionId: sesion.id })).toEqual({ ok: true });
    expect(await (await crearCaller(puerta.id, min(0))).acreditacion.escanear({ sesionId: sesion.id, codigo: blas.codigo })).toMatchObject({
      resultado: "ADMITIDO",
      ocupacion: { asistencias: 1, aforo: 50 },
    });

    // 6. HU-07 estado: durante el congreso el certificado aún no está disponible
    expect(await (await crearCaller(blas.u.id, min(30))).certificado.estado({ congresoId: c.id })).toMatchObject({
      estado: "NO_FINALIZADO",
      disponible: false,
    });
  });
});
