import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    silent: true,
    projects: [
      "e2e/vitest.config.e2e.ts", //
      "src/vitest.config.it.ts",
      "src/vitest.config.ut.ts",
    ],
  },
});
