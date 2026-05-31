import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "e2e",
    dir: "e2e",
    include: ["**/*.test.ts"],
    maxWorkers: 1,
    globals: true,
    isolate: false,
  },
});
