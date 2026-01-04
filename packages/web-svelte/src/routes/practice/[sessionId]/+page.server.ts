import type { Load } from '@sveltejs/kit';
import { practiceApi } from '$lib/utils/api';

export const load: Load = async ({ params }) => {
	const sessionId = params.sessionId;

	try {
		const [sessionRes, questionsRes, streakRes] = await Promise.all([
			practiceApi.getSession(sessionId),
			practiceApi.getSessionQuestions(sessionId, 0, 20),
			practiceApi.getSessionStreak(sessionId).catch(() => ({ data: null }))
		]);

		return {
			session: sessionRes.data || null,
			questions: questionsRes.data?.questions || [],
			totalQuestions: questionsRes.data?.total || 0,
			hasMore: questionsRes.data?.hasMore || false,
			streak: streakRes.data || null,
			error: null
		};
	} catch (error) {
		console.error('Failed to load practice session:', error);
		return {
			session: null,
			questions: [],
			totalQuestions: 0,
			hasMore: false,
			streak: null,
			error: error instanceof Error ? error.message : 'Failed to load practice session'
		};
	}
};
