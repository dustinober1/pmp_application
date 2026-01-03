import { render, screen } from "@testing-library/react";
import FlashcardSessionPage from "./page";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockToast: toastObj,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    sessionId: "session-123",
  }),
}));

vi.mock("@/components/ToastProvider", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/hooks/useRequireAuth", () => ({
  useRequireAuth: () => ({
    user: { id: "u1", emailVerified: true },
    canAccess: true,
    isLoading: false,
  }),
}));

vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(() => new Promise(() => {})),
}));

vi.mock("@/components/FullPageSkeleton", () => ({
  FullPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe("FlashcardSessionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton while loading", () => {
    render(<FlashcardSessionPage />);

    // Should show skeleton while loading
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });
});
