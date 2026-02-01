import type { Config } from "kysely-codegen";

const config: Config = {
  camelCase: true,
  customImports: {
    Uuidv7: "../lib/uuid/v7",
  },
  dialect: "postgres",
  excludePattern: "test.*",
  outFile: "src/db/generated.ts",
  typeMapping: {
    uuid: "Uuidv7",
  },
};

export default config;
