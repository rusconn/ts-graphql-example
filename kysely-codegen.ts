import { defineConfig } from "kysely-codegen";

export default defineConfig({
  camelCase: true,
  customImports: {
    Uuidv7: "../../../util/uuid/v7.ts",
  },
  dialect: "postgres",
  excludePattern: "test.*",
  outFile: "src/infrastructure/datasources/_shared/generated.ts",
  typeMapping: {
    uuid: "Uuidv7", // uuidv7にするとstringになってしまうよう
  },
});
