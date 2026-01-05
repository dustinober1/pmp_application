import type { Load } from "@sveltejs/kit";

// Dashboard now uses localStorage - no server-side data needed
export const prerender = true;

export const load: Load = async () => {
	return {
		user: null,
		error: null,
	};
};
