/**
 * Stub auth hook for static export mode
 *
 * This hook provides a no-op implementation of useRequireAuth for static builds.
 * In static export mode, all authentication and authorization checks are disabled.
 * The site is now a public educational resource without user accounts.
 */
import { useMemo } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  tier: "free" | "pro" | "corporate";
  subscription: {
    tier: "free" | "pro";
    features: string[];
  };
}

interface UseRequireAuthReturn {
  user: User | null;
  canAccess: (feature: string) => boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Stub hook that returns a mock user with pro tier access for static mode.
 * This ensures all tier checks pass in the static export.
 */
export function useRequireAuth(): UseRequireAuthReturn {
  const result = useMemo(() => {
    // Mock user with pro tier access for static mode
    const mockUser: User = {
      id: "static-user",
      email: "static@example.com",
      name: "Static User",
      tier: "pro", // Grant pro access in static mode
      subscription: {
        tier: "pro",
        features: ["all"],
      },
    };

    return {
      user: mockUser,
      // Grant access to all features in static mode
      canAccess: () => true,
      // Never loading in static mode
      isLoading: false,
      // Not authenticated (static site has no auth)
      isAuthenticated: false,
    };
  }, []);

  return result;
}
