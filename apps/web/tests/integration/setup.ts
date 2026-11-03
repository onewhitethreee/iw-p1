import { afterAll, beforeEach } from "vitest";
import { db } from "~/server/db";

/** Vacía todas las tablas antes de cada prueba para que sean independientes. */
beforeEach(async () => {
  const tablas = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tablas.length) {
    await db.$executeRawUnsafe(`TRUNCATE ${tablas.map((t) => `"${t.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`);
  }
});

afterAll(async () => {
  await db.$disconnect();
});
