import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true,
      },
    }),
  ],
  resolve: {
    alias: {
      $lib: "/src/lib",
      "$lib/*": "/src/lib/*",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/**/*.{test,spec}.{js,ts}",
        "src/routes/+layout.ts",
        "src/hooks.server.ts",
      ],
    },
    setupFiles: ["./src/test/setup.ts"],
  },
});
