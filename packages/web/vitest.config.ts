import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 65,
        functions: 70,
        lines: 75,
        statements: 70,
      },
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
