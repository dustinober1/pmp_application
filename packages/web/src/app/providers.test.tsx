import { render, screen, waitFor } from "@testing-library/react";
import { Providers } from "./providers";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockPush, mockUseAuth, mockPathname } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockUseAuth: vi.fn(),
    mockPathname: vi.fn(() => "/dashboard"),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/components/ToastProvider", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toast-provider">{children}</div>
  ),
  useToast: () => ({
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock("@/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

vi.mock("@/components/I18nProvider", () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18n-provider">{children}</div>
  ),
}));

vi.mock("@/components/SkipToContentLink", () => ({
  SkipToContentLink: () => (
    <a href="#content" data-testid="skip-link">
      Skip to content
    </a>
  ),
}));

vi.mock("@/lib/sync", () => ({}));

describe("Providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it("renders all providers in correct hierarchy", () => {
    render(
      <Providers>
        <div data-testid="child-content">Test Child</div>
      </Providers>,
    );

    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("i18n-provider")).toBeInTheDocument();
    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("toast-provider")).toBeInTheDocument();
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByTestId("skip-link")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(
      <Providers>
        <main>Application Content</main>
      </Providers>,
    );

    expect(screen.getByText("Application Content")).toBeInTheDocument();
  });

  it("skip to content link is rendered", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    expect(screen.getByTestId("skip-link")).toBeInTheDocument();
  });
});

describe("EmailVerificationGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/dashboard");
  });

  it("does not redirect when loading", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test", emailVerified: false },
      isAuthenticated: true,
      isLoading: true,
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("does not redirect when not authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("does not redirect when email is verified", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test", emailVerified: true },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("redirects to verify-email when email is not verified", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test", emailVerified: false },
      isAuthenticated: true,
      isLoading: false,
    });
    mockPathname.mockReturnValue("/dashboard");

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/auth/verify-email?next=%2Fdashboard",
      );
    });
  });

  it("does not redirect when already on verify-email page", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", name: "Test", emailVerified: false },
      isAuthenticated: true,
      isLoading: false,
    });
    mockPathname.mockReturnValue("/auth/verify-email");

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
