import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.base.config.ts";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      dir: "e2e/presentation/graphql/schema/Mutation",
      include: ["**/*.test.ts"],
      maxWorkers: 1,
    },
  }),
);
