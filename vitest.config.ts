import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: ["**/*.ts"],
    watch: false,
    globals: true,
    silent: true,
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
