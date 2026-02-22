import { defineConfig, mergeConfig } from "vitest/config";

import base from "./vitest.base.config.ts";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      dir: "src",
      include: ["**/*.test.ts"],
      maxWorkers: 1, // TODO: テストデータを一意にしたら消す
    },
  }),
);
