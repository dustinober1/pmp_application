import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [
		svelte({
			hot: false,
			compilerOptions: {
				runes: true
			}
		})
	],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: ['src/**/*.{test,spec}.{js,ts}']
		}
	},
	resolve: {
		conditions: ['browser', 'import'],
		alias: {
			'$lib': path.resolve(__dirname, './src/lib'),
			'$lib/components': path.resolve(__dirname, './src/lib/components'),
			'@pmp/shared': path.resolve(__dirname, '../shared/src')
		}
	}
});
