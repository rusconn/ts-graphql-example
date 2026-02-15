import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.base.config.ts";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      dir: "tests/graphql/Mutation",
      include: ["**/*.test.ts"],
      maxWorkers: 1,
    },
  }),
);
