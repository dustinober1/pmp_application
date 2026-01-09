import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // Base path for GitHub Pages deployment
    // Change this if deploying to a different URL
    paths: {
      base: "/pmp_application",
    },
    // Using static adapter for GitHub Pages deployment
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
      precompress: false,
      strict: true,
    }),
    alias: {
      "@pmp/shared": path.resolve("../shared/src"),
    },
    prerender: {
      handleMissingId: "warn",
    },
  },
};

export default config;
