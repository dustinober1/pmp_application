import type { Load } from '@sveltejs/Kit';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const load: Load = async () => {
	try {
		const faqPath = join(__dirname, '../../../../static/data/faq.md');
		const faqContent = readFileSync(faqPath, 'utf-8');
		return {
			faqContent,
			error: null
		};
	} catch (error) {
		console.error('Failed to load FAQ content:', error);
		return {
			faqContent: '',
			error: error instanceof Error ? error.message : 'Failed to load FAQ content'
		};
	}
};
