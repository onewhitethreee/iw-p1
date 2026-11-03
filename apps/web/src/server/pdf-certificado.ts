import { fecha, hora } from "@congresalia/domain";
import { PDFDocument, rgb, StandardFonts, type PDFFont } from "pdf-lib";
import { calcularCertificado, type EstadoCertificado } from "~/server/certificado";
import { db } from "~/server/db";
import type { UsuarioActual } from "~/server/usuarios";

/** HU-07: PDF del certificado con pdf-lib (plan R6). */

const TITULO = "Certificado de asistencia";

function partes(d: Date, zona: string) {
  const p = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: zona }).formatToParts(d);
  const v = (t: string) => p.find((x) => x.type === t)!.value;
  return { dia: v("day"), mes: v("month"), anio: v("year") };
}

/** «del 10 al 12 de mayo de 2027», «del 30 de junio al 2 de julio de 2027» o «el 10 de mayo de 2027». */
export function rangoFechas(inicio: Date, fin: Date, zona: string): string {
  const a = partes(inicio, zona);
  const b = partes(fin, zona);
  if (a.anio !== b.anio) return `del ${a.dia} de ${a.mes} de ${a.anio} al ${b.dia} de ${b.mes} de ${b.anio}`;
  if (a.mes !== b.mes) return `del ${a.dia} de ${a.mes} al ${b.dia} de ${b.mes} de ${b.anio}`;
  if (a.dia !== b.dia) return `del ${a.dia} al ${b.dia} de ${b.mes} de ${b.anio}`;
  return `el ${a.dia} de ${a.mes} de ${a.anio}`;
}

/** Contenido del certificado, línea a línea (pura, se prueba aparte del PDF). */
export function lineasCertificado(d: EstadoCertificado, emitido: Date): string[] {
  const z = d.congreso.zonaHoraria;
  return [
    TITULO,
    "",
    "Se certifica que",
    d.titular ?? "",
    `ha asistido al congreso «${d.congreso.nombre}», celebrado ${rangoFechas(d.congreso.inicio, d.congreso.fin, z)} en ${d.congreso.sede},`,
    `con una asistencia del ${d.porcentaje} % de las sesiones de su agenda (${d.asistidas} de ${d.total}).`,
    "",
    "Sesiones asistidas:",
    ...d.sesiones.filter((s) => s.asistida).map((s) => `• ${fecha(s.inicio, z)}, ${hora(s.inicio, z)}–${hora(s.fin, z)} · ${s.titulo} (${s.sala})`),
    "",
    `Horas de formación: ${d.horas.texto}`,
    "",
    `Emitido el ${fecha(emitido, z)}.`,
  ];
}

function partir(texto: string, fuente: PDFFont, tam: number, ancho: number): string[] {
  const out: string[] = [];
  let linea = "";
  for (const palabra of texto.split(" ")) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (fuente.widthOfTextAtSize(prueba, tam) > ancho && linea) {
      out.push(linea);
      linea = palabra;
    } else linea = prueba;
  }
  out.push(linea);
  return out;
}

export async function generarPdfCertificado(d: EstadoCertificado, emitido: Date): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(TITULO);
  pdf.setSubject(`${d.titular ?? ""} · ${d.congreso.nombre}`);
  pdf.setAuthor("Congresalia");
  pdf.setCreationDate(emitido);
  const pagina = pdf.addPage([595.28, 841.89]); // A4
  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const negrita = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margen = 64;
  const ancho = pagina.getWidth() - 2 * margen;
  let y = pagina.getHeight() - 96;

  const [titulo, , intro, nombre, ...resto] = lineasCertificado(d, emitido);
  const centrado = (t: string, f: PDFFont, tam: number) => {
    pagina.drawText(t, { x: (pagina.getWidth() - f.widthOfTextAtSize(t, tam)) / 2, y, size: tam, font: f, color: rgb(0.1, 0.1, 0.2) });
    y -= tam * 1.6;
  };
  centrado(titulo!, negrita, 26);
  y -= 16;
  centrado(intro!, normal, 12);
  centrado(nombre!, negrita, 20);
  y -= 8;
  for (const l of resto) {
    if (!l) {
      y -= 8;
      continue;
    }
    const f = l.startsWith("Horas de formación") || l === "Sesiones asistidas:" ? negrita : normal;
    for (const trozo of partir(l, f, 11, ancho)) {
      pagina.drawText(trozo, { x: margen, y, size: 11, font: f });
      y -= 16;
    }
  }
  return pdf.save();
}

const texto = (status: number, cuerpo: string) =>
  new Response(cuerpo, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

/**
 * Respuesta de `GET /api/certificado/[congresoId]` (plan R6, analyze U1): vuelve a comprobar todas las
 * condiciones en el servidor (FR-005) y solo entrega el certificado del propio usuario (clarify P1).
 */
export async function respuestaCertificado(usuario: UsuarioActual | null, congresoId: string, ahora: Date): Promise<Response> {
  if (!usuario) return texto(401, "Tienes que iniciar sesión");
  const d = await calcularCertificado(db, usuario.id, congresoId, ahora);
  if (!d) return texto(404, "El congreso no existe");
  if (!d.disponible) return texto(403, d.motivo);
  const bytes = await generarPdfCertificado(d, ahora);
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificado-${d.congreso.slug}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
