import { builtinModules } from "node:module";

import { defineConfig } from "vite";

import { dependencies } from "./package.json";

export default defineConfig({
  build: {
    target: "es2023",
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
});
