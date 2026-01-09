import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [sveltekit()],
  // Set base path for GitHub Pages deployment
  // Change this if deploying to a different URL
  base: "/pmp_application/",
  resolve: {
    alias: {
      "@pmp/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  build: {
    // Optimize chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify output with terser
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable source maps for production debugging (set to false for smaller bundle)
    sourcemap: false,
    // Note: manualChunks removed as it conflicts with SvelteKit's adapter-static
    // SvelteKit handles chunking automatically
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['marked', 'isomorphic-dompurify'],
  },
});
