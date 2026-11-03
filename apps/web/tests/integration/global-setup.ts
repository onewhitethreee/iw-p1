import { execSync } from "node:child_process";
import { loadEnv } from "vite";

/** Aplica las migraciones a la BD de pruebas una vez antes de todas las pruebas. */
export default function setup() {
  const env = loadEnv("test", process.cwd(), "");
  const url = env.DATABASE_URL_TEST ?? process.env.DATABASE_URL_TEST;
  execSync("pnpm exec prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } });
}
