import { defineConfig } from "kysely-codegen";

export default defineConfig({
  camelCase: true,
  customImports: {
    Uuid: "../../../util/uuid/vn.ts",
  },
  dialect: "postgres",
  excludePattern: "test.*",
  outFile: "src/infrastructure/datasources/_shared/generated.ts",
  typeMapping: {
    uuid: "Uuid", // DBにuuidv7を用意できたらUuidv7型へ変更する
  },
});
