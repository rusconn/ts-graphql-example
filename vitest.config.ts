// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /@\/(.*)/,
        replacement: "src/$1",
      },
      {
        find: /tests\/(.*)/,
        replacement: "tests/$1",
      },
    ],
  },
});
