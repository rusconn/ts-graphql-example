import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: [
    "e2e/graphql/_shared/types.ts",
    "src/infrastructure/datasources/_shared/generated.ts",
    "src/presentation/graphql/schema/_types.ts",
  ],
  sortImports: true,
  sortPackageJson: false,
});
