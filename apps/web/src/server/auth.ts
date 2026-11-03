import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "~/server/db";

const credencialesSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class CredencialesInvalidas extends CredentialsSignin {
  code = "credenciales";
}

/**
 * Auth.js v5 con correo y contraseña (research R2). La sesión JWT solo guarda el id del usuario:
 * los roles se releen de la base de datos en cada petición (ver server/api/trpc.ts y server/guards.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/entrar" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credencialesSchema.safeParse(raw);
        if (!parsed.success) throw new CredencialesInvalidas();
        const usuario = await db.usuario.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!usuario || !(await bcrypt.compare(parsed.data.password, usuario.passwordHash))) {
          throw new CredencialesInvalidas();
        }
        return { id: usuario.id, name: usuario.nombre, email: usuario.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
