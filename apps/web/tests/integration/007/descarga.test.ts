import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { calcularCertificado } from "~/server/certificado";
import { db } from "~/server/db";
import { lineasCertificado, respuestaCertificado } from "~/server/pdf-certificado";
import { cargarUsuario } from "~/server/usuarios";
import { crearUsuario } from "../helpers";
import { asistente, DESPUES, escenario } from "./fixtures";

const usuario = (id: string) => cargarUsuario(id);

describe("descarga del certificado (respuestaCertificado, US1)", () => {
  it("(a) US1-1 200 con un PDF válido, adjunto y generado en < 3 s (SC-002)", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 4 });
    const t0 = performance.now();
    const res = await respuestaCertificado(await usuario(u.id), e.c.id, DESPUES);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const ms = performance.now() - t0;
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toBe(`attachment; filename="certificado-${e.c.slug}.pdf"`);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getTitle()).toBe("Certificado de asistencia");
    expect(pdf.getPageCount()).toBe(1);
    expect(ms).toBeLessThan(3000);
  });

  it("(b) las líneas del PDF incluyen nombre, congreso, fechas, sede, las sesiones asistidas y las horas", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 4, nombre: "Lucía Pérez Núñez" });
    const datos = (await calcularCertificado(db, u.id, e.c.id, DESPUES))!;
    const texto = lineasCertificado(datos, DESPUES).join("\n");
    expect(texto).toContain("Certificado de asistencia");
    expect(texto).toContain("Lucía Pérez Núñez");
    expect(texto).toContain(e.c.nombre);
    expect(texto).toContain("Sede de pruebas");
    expect(texto).toContain("del 10 al 12 de mayo de 2027");
    for (const t of ["Sesión 1", "Sesión 2", "Sesión 3", "Sesión 4"]) expect(texto).toContain(t);
    expect(texto).not.toContain("Sesión 5");
    expect(texto).toContain("Horas de formación: 4 h 30 min");
  });

  it("(c) US1-3 3 de 5 → 403 con el motivo en texto", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 3 });
    const res = await respuestaCertificado(await usuario(u.id), e.c.id, DESPUES);
    expect(res.status).toBe(403);
    expect(await res.text()).toBe("No disponible: has asistido al 60 % de las sesiones de tu agenda (3 de 5); se necesita al menos el 80 %");
  });

  it("(d) US1-6 nadie obtiene el certificado de otra persona; sin sesión → 401; congreso inexistente → 404", async () => {
    const e = await escenario();
    await asistente(e, { asistidas: 5 });
    const org = await crearUsuario(["ORGANIZADOR"]);
    const otro = await crearUsuario(["ASISTENTE"]);
    for (const id of [org.id, otro.id]) {
      const res = await respuestaCertificado(await usuario(id), e.c.id, DESPUES);
      expect(res.status).toBe(403);
      expect(await res.text()).toBe("No tienes una inscripción confirmada en este congreso");
    }
    expect((await respuestaCertificado(null, e.c.id, DESPUES)).status).toBe(401);
    expect((await respuestaCertificado(await usuario(otro.id), "no-existe", DESPUES)).status).toBe(404);
  });

  it("(e) se puede descargar varias veces", async () => {
    const e = await escenario();
    const { u } = await asistente(e, { asistidas: 4 });
    const yo = await usuario(u.id);
    expect((await respuestaCertificado(yo, e.c.id, DESPUES)).status).toBe(200);
    expect((await respuestaCertificado(yo, e.c.id, DESPUES)).status).toBe(200);
  });

  it("converge T011: nombre y título con caracteres fuera de WinAnsi → 200 y PDF válido", async () => {
    const e = await escenario();
    await db.propuesta.updateMany({ where: { congresoId: e.c.id, titulo: "Sesión 1" }, data: { titulo: "Ratio ≥ 1:1 en el aula" } });
    const { u } = await asistente(e, { asistidas: 4, nombre: "刘洋峰 Łukasz" });
    const res = await respuestaCertificado(await usuario(u.id), e.c.id, DESPUES);
    expect(res.status).toBe(200);
    const pdf = await PDFDocument.load(new Uint8Array(await res.arrayBuffer()));
    expect(pdf.getSubject()).toContain("Lukasz");
  });
});
