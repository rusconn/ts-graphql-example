import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    "e2e/graphql/_shared/types.ts",
    "src/infrastructure/datasources/_shared/generated.ts",
    "src/presentation/graphql/schema/_types.ts",
    "pnpm-lock.yaml",
  ],
  categories: {
    correctness: "error",
  },
});
