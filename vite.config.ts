import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/extension.ts"),
      name: "extension",
      fileName: "extension",
      formats: ["cjs"]
    },
    rollupOptions: {
      external: [
        'vscode',
        'path',
        'fs',
        'os',
        'module',
        'url',
        'util',
        'stream',
        'buffer',
        'process',
        'vue-comp-to-setup',
        'vue-i18n-migrator',
        'vue-class-to-composition'
      ],
      output: {
        format: "cjs",
        entryFileNames: "extension.js"
      }
    },
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
    target: "node22"
  }
});
