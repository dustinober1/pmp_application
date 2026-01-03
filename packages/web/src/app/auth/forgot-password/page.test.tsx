import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "./page";
import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockApiRequest, mockToast } = vi.hoisted(() => {
  const toastObj = {
    show: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    mockApiRequest: vi.fn(),
    mockToast: toastObj,
  };
});

vi.mock("@/lib/api", () => ({
  apiRequest: mockApiRequest,
}));

vi.mock("@/components/ToastProvider", () => ({
  useToast: () => mockToast,
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password form", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("heading", { name: "Reset your password" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Reset Link" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to Login/i }),
    ).toBeInTheDocument();
  });

  it("shows loading state when submitting", async () => {
    mockApiRequest.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100),
        ),
    );
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

    expect(screen.getByText("Sending...")).toBeInTheDocument();
  });

  it("submits form and shows success message", async () => {
    mockApiRequest.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith("/auth/forgot-password", {
        method: "POST",
        body: { email: "test@example.com" },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Check your email" }),
      ).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("displays error on failed request", async () => {
    mockApiRequest.mockRejectedValue(new Error("Network error"));
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to send password reset email. Please try again later.",
        ),
      ).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to send password reset email. Please try again later.",
      );
    });
  });

  it("shows return to login link on success", async () => {
    mockApiRequest.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Reset Link" }));

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Return to Login" }),
      ).toBeInTheDocument();
    });
  });
});
