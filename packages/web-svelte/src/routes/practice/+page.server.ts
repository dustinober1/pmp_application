import type { Load } from '@sveltejs/kit';
import { practiceApi, contentApi } from '$lib/utils/api';

export const load: Load = async ({ fetch }) => {
	try {
		const [statsRes, domainsRes, mockExamsRes] = await Promise.all([
			practiceApi.getStats(),
			contentApi.getDomains(),
			practiceApi.startMockExam().catch(() => ({ data: { exams: [], count: 0 } }))
		]);

		return {
			stats: statsRes.data?.stats || null,
			domains: domainsRes.data?.domains || [],
			mockExams: mockExamsRes.data?.exams || [],
			error: null
		};
	} catch (error) {
		console.error('Failed to load practice data:', error);
		return {
			stats: null,
			domains: [],
			mockExams: [],
			error: error instanceof Error ? error.message : 'Failed to load practice data'
		};
	}
};
