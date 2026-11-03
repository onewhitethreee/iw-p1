"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { signIn, signOut } from "~/server/auth";
import { api } from "~/trpc/server";

export interface EstadoFormulario {
  error?: string;
  campos?: Record<string, string[] | undefined>;
}

function destinoSeguro(desde: FormDataEntryValue | null) {
  const d = typeof desde === "string" ? desde : "";
  return d.startsWith("/") && !d.startsWith("//") ? d : "/";
}

export async function entrar(_prev: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  try {
    await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirectTo: destinoSeguro(form.get("desde")),
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "Correo o contraseña incorrectos" };
    throw e; // la redirección de éxito de Next.js se propaga
  }
}

export async function registrar(_prev: EstadoFormulario, form: FormData): Promise<EstadoFormulario> {
  const datos = {
    nombre: String(form.get("nombre") ?? ""),
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
    rol: String(form.get("rol") ?? "") as "PONENTE" | "ASISTENTE",
  };
  try {
    await (await api()).auth.registrar(datos);
  } catch (e) {
    if (e instanceof TRPCError) {
      if (e.cause instanceof ZodError) return { error: "Revisa los datos del formulario", campos: e.cause.flatten().fieldErrors };
      return { error: e.message };
    }
    throw e;
  }
  await signIn("credentials", { email: datos.email, password: datos.password, redirectTo: destinoSeguro(form.get("desde")) });
  return {};
}

/** Clarify P2: botón «Quiero ser también ponente/asistente». */
export async function anadirRolPropio(form: FormData) {
  const rol = form.get("rol") === "PONENTE" ? "PONENTE" : "ASISTENTE";
  await (await api()).auth.anadirRolPropio({ rol });
  revalidatePath("/", "layout");
}

export async function salir() {
  await signOut({ redirectTo: "/" });
}
