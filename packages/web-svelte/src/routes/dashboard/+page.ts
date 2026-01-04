import type { Load } from "@sveltejs/kit";

// Dashboard now uses localStorage - no server-side data needed
export const load: Load = async () => {
	return {
		user: null,
		error: null,
	};
};
