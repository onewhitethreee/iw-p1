import type { NextConfig } from "next";

const config: NextConfig = {
  // packages/domain se publica como TypeScript fuente dentro del monorepo
  transpilePackages: ["@congresalia/domain"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default config;
