import { builtinModules } from "node:module";

import { defineConfig } from "vite";

import { dependencies } from "./package.json";

export default defineConfig({
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      external: [/^node:.+/, ...builtinModules, ...Object.keys(dependencies)],
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
    silent: true,
    poolOptions: {
      threads: {
        useAtomics: true,
        singleThread: true,
      },
    },
    watch: false,
    includeSource: ["**/*.ts"],
  },
});
