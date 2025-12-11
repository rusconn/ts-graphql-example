import type { Config } from "kysely-codegen";

const config: Config = {
  camelCase: true,
  dialect: "postgres",
  excludePattern: "test.*",
  outFile: "src/db/generated.ts",
};

export default config;
