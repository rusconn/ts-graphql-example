import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "it",
    dir: "src",
    include: ["**/*.test.ts"],
    maxWorkers: 1, // TODO: テストデータを一意にしたら消す
    globals: true,
    isolate: false,
  },
});
