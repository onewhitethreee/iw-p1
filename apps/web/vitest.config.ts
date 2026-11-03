import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const testUrl = env.DATABASE_URL_TEST ?? process.env.DATABASE_URL_TEST;
  if (!testUrl) throw new Error("Falta DATABASE_URL_TEST (ver apps/web/.env.example)");
  return {
    plugins: [tsconfigPaths()],
    test: {
      include: ["tests/integration/**/*.test.ts"],
      env: { ...env, DATABASE_URL: testUrl, NODE_ENV: "test" },
      globalSetup: ["tests/integration/global-setup.ts"],
      setupFiles: ["tests/integration/setup.ts"],
      // Todas las pruebas comparten la BD de pruebas: se ejecutan en serie
      fileParallelism: false,
      testTimeout: 20_000,
    },
  };
});
