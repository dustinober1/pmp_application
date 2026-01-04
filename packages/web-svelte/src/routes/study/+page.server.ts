import type { Load } from '@sveltejs/kit';
import { contentApi } from '$lib/utils/api';

export const load: Load = async ({ fetch }) => {
	try {
		const response = await contentApi.getDomains();
		return {
			domains: response.data?.domains || [],
			error: null
		};
	} catch (error) {
		console.error('Failed to load study data:', error);
		return {
			domains: [],
			error: error instanceof Error ? error.message : 'Failed to load study content'
		};
	}
};
