/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { get } from "svelte/store";
import { authStore, auth, user, isAuthenticated, isLoading } from "./auth";
import type { UserProfile } from "@pmp/shared";

// Mock API request
vi.mock("$lib/api", () => ({
  apiRequest: vi.fn(),
}));

describe("Auth Store", () => {
  const mockUser: UserProfile = {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    tier: "free",
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store to initial state
    authStore.logout();
  });

  describe("Initial State", () => {
    it("has correct initial state", () => {
      const state = get(authStore);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });

    it("derived stores reflect initial state", () => {
      expect(get(user)).toBeNull();
      expect(get(isAuthenticated)).toBe(false);
      expect(get(isLoading)).toBe(true);
    });
  });

  describe("Login", () => {
    it("should update state on successful login", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.login("test@example.com", "password123");

      const state = get(authStore);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("should handle login failure", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: null },
      });

      await authStore.login("test@example.com", "wrongpassword");

      const state = get(authStore);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should call API with correct parameters", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.login("test@example.com", "password123", true);

      expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: {
          email: "test@example.com",
          password: "password123",
          rememberMe: true,
        },
      });
    });
  });

  describe("Register", () => {
    it("should update state on successful registration", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.register("test@example.com", "password123", "Test User");

      const state = get(authStore);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("should handle registration failure", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: null },
      });

      await authStore.register("test@example.com", "password123", "Test User");

      const state = get(authStore);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should call API with correct parameters", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.register("new@example.com", "password123", "New User");

      expect(apiRequest).toHaveBeenCalledWith("/auth/register", {
        method: "POST",
        body: {
          email: "new@example.com",
          password: "password123",
          name: "New User",
        },
      });
    });
  });

  describe("Logout", () => {
    it("should clear state on logout", async () => {
      const { apiRequest } = await import("$lib/api");

      // First login
      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });
      await authStore.login("test@example.com", "password123");

      // Then logout
      (apiRequest as any).mockResolvedValue({});
      await authStore.logout();

      const state = get(authStore);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should call logout API endpoint", async () => {
      const { apiRequest } = await import("$lib/api");

      // Login first
      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });
      await authStore.login("test@example.com", "password123");

      // Clear mock before logout
      (apiRequest as any).mockClear();
      (apiRequest as any).mockResolvedValue({});

      await authStore.logout();

      expect(apiRequest).toHaveBeenCalledWith("/auth/logout", {
        method: "POST",
      });
    });

    it("should clear state even if API call fails", async () => {
      const { apiRequest } = await import("$lib/api");

      // Login first
      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });
      await authStore.login("test@example.com", "password123");

      // Mock API failure
      (apiRequest as any).mockRejectedValue(new Error("Network error"));

      await authStore.logout();

      const state = get(authStore);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("Refresh Token", () => {
    it("should refresh user data on successful token refresh", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any)
        .mockResolvedValueOnce({
          data: { user: mockUser },
        })
        .mockResolvedValueOnce({
          data: { user: mockUser },
        });

      await authStore.login("test@example.com", "password123");
      await authStore.refreshToken();

      expect(apiRequest).toHaveBeenCalledWith("/auth/refresh", {
        method: "POST",
      });

      const state = get(authStore);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should logout on token refresh failure", async () => {
      const { apiRequest } = await import("$lib/api");

      // Login first
      (apiRequest as any).mockResolvedValueOnce({
        data: { user: mockUser },
      });
      await authStore.login("test@example.com", "password123");

      // Mock refresh failure
      (apiRequest as any).mockRejectedValueOnce(
        new Error("Invalid refresh token"),
      );

      await authStore.refreshToken();

      const state = get(authStore);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("Refresh User", () => {
    it("should hydrate user data", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.refreshUser();

      const state = get(authStore);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("Derived Stores", () => {
    it("user store should reflect current user", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.login("test@example.com", "password123");

      expect(get(user)).toEqual(mockUser);
    });

    it("isAuthenticated store should reflect auth status", async () => {
      const { apiRequest } = await import("$lib/api");

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await authStore.login("test@example.com", "password123");

      expect(get(isAuthenticated)).toBe(true);

      (apiRequest as any).mockResolvedValue({});
      await authStore.logout();

      expect(get(isAuthenticated)).toBe(false);
    });

    it("isLoading store should reflect loading state", async () => {
      const { apiRequest } = await import("$lib/api");

      const loadingPromise = authStore.login("test@example.com", "password123");
      expect(get(isLoading)).toBe(true);

      (apiRequest as any).mockResolvedValue({
        data: { user: mockUser },
      });

      await loadingPromise;
      expect(get(isLoading)).toBe(false);
    });
  });

  describe("Auth Alias", () => {
    it("auth should be an alias for authStore", () => {
      expect(auth).toBe(authStore);
    });
  });
});
