import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.base.config.ts";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      dir: "src",
      includeSource: ["**/*.ts"],
      exclude: ["**/*.test.ts"],
    },
  }),
);
