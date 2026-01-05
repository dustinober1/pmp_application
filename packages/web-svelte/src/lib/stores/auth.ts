import { writable, derived } from "svelte/store";
import { UserTier, type UserProfile } from "@pmp/shared";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

function createAuthStore() {
  const { subscribe, set } = writable<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Default static user
  const staticUser: UserProfile = {
    id: "local-user",
    email: "student@example.com",
    name: "PMP Student",
    emailVerified: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    tier: UserTier.PRO, // Give pro access by default since it's free now
    createdAt: new Date(),
    updatedAt: new Date()
  };

  async function hydrate(): Promise<void> {
    if (typeof window === "undefined") return;

    // In a static site with no backend, we just auto-login the user
    // We can check localStorage if we want to persist custom names later,
    // but for now, just set the static user.
    set({
      user: staticUser,
      isLoading: false,
      isAuthenticated: true,
    });
  }

  // Mock functions that simulate auth actions
  async function login(): Promise<void> {
    await hydrate();
  }

  async function register(): Promise<void> {
    await hydrate();
  }

  async function logout(): Promise<void> {
    // For a static site, "logout" just reloads the page or does nothing.
    // We could clear localStorage if we were using it for state.
    // For now, let's keep them logged in or allow a 'reset'.
    set({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
    // Immediately re-login after a short delay to simulate "public" site behavior?
    // Or just leave them logged out. Let's leave them logged out until refresh.
  }

  async function refreshToken(): Promise<void> {
    await hydrate();
  }

  async function refreshUser(): Promise<void> {
    await hydrate();
  }

  // Initialize
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
export const auth = authStore;

export const user = derived(authStore, ($auth) => $auth.user);
export const isLoading = derived(authStore, ($auth) => $auth.isLoading);
export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
