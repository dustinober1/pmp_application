import { writable, derived, get } from "svelte/store";
import type { UserProfile } from "@pmp/shared";
import { apiRequest } from "$lib/api";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Hydrate auth state on client-side
  async function hydrate(): Promise<void> {
    // Skip hydration during server-side rendering
    if (typeof window === "undefined") {
      return;
    }

    try {
      const response = await apiRequest<{ user: UserProfile }>("/auth/me");
      const user = response.data?.user || null;

      set({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    } catch (error) {
      set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }

  async function login(
    email: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<void> {
    const response = await apiRequest<{ user: UserProfile }>("/auth/login", {
      method: "POST",
      body: { email, password, rememberMe },
    });

    const user = response.data?.user || null;
    set({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    });
  }

  async function register(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    const response = await apiRequest<{ user: UserProfile }>("/auth/register", {
      method: "POST",
      body: { email, password, name },
    });

    const user = response.data?.user || null;
    set({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    });
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      set({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }

  async function refreshToken(): Promise<void> {
    try {
      await apiRequest("/auth/refresh", { method: "POST" });
      await hydrate();
    } catch {
      await logout();
    }
  }

  async function refreshUser(): Promise<void> {
    await hydrate();
  }

  // Initialize hydration on client
  if (typeof window !== "undefined") {
    hydrate();
  }

  return {
    subscribe,
    login,
    register,
    logout,
    refreshToken,
    refreshUser,
    hydrate,
  };
}

export const authStore = createAuthStore();

// Export as 'auth' for compatibility with existing components
export const auth = authStore;

// Derived stores for convenience
export const user = derived(authStore, ($auth) => $auth.user);
export const isLoading = derived(authStore, ($auth) => $auth.isLoading);
export const isAuthenticated = derived(
  authStore,
  ($auth) => $auth.isAuthenticated,
);
