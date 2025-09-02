import path from "node:path";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "schema", "migrations"),
    seed: `node ${path.join("prisma", "seed.ts")}`,
  },
});
