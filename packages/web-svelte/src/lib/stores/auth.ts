/**
 * Authentication Store for SvelteKit
 * Placeholder for migration - will be connected to API later
 */

import { writable, derived } from 'svelte/store';

interface UserProfile {
	id: number;
	name: string;
	email: string;
	tier: string;
}

interface AuthState {
	user: UserProfile | null;
	isLoading: boolean;
	isAuthenticated: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		isLoading: false,
		isAuthenticated: false
	});

	return {
		subscribe,
		login: async (email: string, password: string, rememberMe?: boolean) => {
			// TODO: Implement login API call
			console.log('Login:', { email, rememberMe });
		},
		register: async (email: string, password: string, name: string) => {
			// TODO: Implement register API call
			console.log('Register:', { email, name });
		},
		logout: async () => {
			// TODO: Implement logout API call
			set({ user: null, isLoading: false, isAuthenticated: false });
		},
		refreshUser: async () => {
			// TODO: Implement refresh API call
			console.log('Refresh user');
		}
	};
}

export const auth = createAuthStore();

// Derived selectors for convenience
export const user = derived(auth, ($auth) => $auth.user);
export const isAuthenticated = derived(auth, ($auth) => $auth.isAuthenticated);
