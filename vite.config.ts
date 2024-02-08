import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { dependencies } from "./package.json";

export default defineConfig({
  build: {
    target: "es2021",
    sourcemap: true,
    rollupOptions: {
      external: [/^node:.+/, ...Object.keys(dependencies)],
    },
    lib: {
      entry: "src/main",
      fileName: "main",
      formats: ["es"],
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    globals: true,
    includeSource: ["**/*.ts"],
  },
  plugins: [tsconfigPaths()],
});
