import { execSync } from "node:child_process";

/** Las pruebas e2e modifican datos (asignar, decidir…): cada ejecución parte de un seed limpio. */
export default function globalSetup() {
  execSync("pnpm db:seed", { stdio: "pipe" });
}
