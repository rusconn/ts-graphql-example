import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.base.config.ts";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      dir: "e2e/graphql",
      include: ["*.test.ts"], // TODO: "**/*.test.ts"へ変更
      maxWorkers: 1,
    },
  }),
);
