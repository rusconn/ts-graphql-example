import type { Config } from "kysely-codegen";

const config: Config = {
  camelCase: true,
  customImports: {
    Uuid: "../../../lib/uuid/vn.ts",
  },
  dialect: "postgres",
  excludePattern: "test.*",
  outFile: "src/infra/datasources/_shared/generated.ts",
  typeMapping: {
    uuid: "Uuid", // DBにuuidv7を用意できたらUuidv7型へ変更する
  },
};

export default config;
