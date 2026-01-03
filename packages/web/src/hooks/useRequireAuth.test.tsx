import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockPush, mockUseAuth } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUseAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: mockUseAuth,
}));

import { useRequireAuth } from "./useRequireAuth";

// Test component that uses the hook
function TestComponent() {
  const { user, isAuthenticated, isLoading, isEmailVerified, canAccess } =
    useRequireAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="emailVerified">{isEmailVerified.toString()}</div>
      <div data-testid="canAccess">{canAccess.toString()}</div>
      <div data-testid="user">{user?.name ?? "null"}</div>
    </div>
  );
}

describe("useRequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns loading state while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to login when not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<TestComponent />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login?next=%2Fdashboard");
    });
  });

  it("does not redirect when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test", emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
  });

  it("returns isEmailVerified correctly for verified user", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test", emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("emailVerified")).toHaveTextContent("true");
  });

  it("returns isEmailVerified correctly for unverified user", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test", emailVerified: false },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("emailVerified")).toHaveTextContent("false");
  });

  it("canAccess is true only when authenticated and email verified", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test", emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("canAccess")).toHaveTextContent("true");
  });

  it("canAccess is false when authenticated but email not verified", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test", emailVerified: false },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("canAccess")).toHaveTextContent("false");
  });

  it("canAccess is false when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("canAccess")).toHaveTextContent("false");
  });

  it("returns user data when available", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test User", emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<TestComponent />);

    expect(screen.getByTestId("user")).toHaveTextContent("Test User");
  });
});
