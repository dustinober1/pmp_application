/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import CheckoutPage from "./page";

// Mock window.location.href before any tests run
const originalLocation = window.location;
delete (window as any).location;

const mockRouter = {
  push: vi.fn(),
};
const mockApiRequest = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: (key: string) => (key === "tier" ? "pro" : null),
  }),
}));

vi.mock("@/lib/api", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

vi.mock("@/components/Navbar", () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe("CheckoutPage", () => {
  const mockTierData = {
    tiers: [
      {
        id: "pro",
        name: "pro",
        price: 29,
        billingPeriod: "monthly" as const,
      },
      {
        id: "pro",
        name: "pro",
        price: 9.99,
        billingPeriod: "monthly" as const,
      },
      {
        id: "corporate",
        name: "corporate",
        price: 19.99,
        billingPeriod: "annual" as const,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockResolvedValue({
      success: true,
      data: mockTierData,
    });
    window.location = { href: "", ...originalLocation };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("renders checkout form with loading state initially", async () => {
    mockApiRequest.mockImplementation(() => new Promise(() => {}));

    render(<CheckoutPage />);

    // Should show loading spinner
    await waitFor(() => {
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  it("renders checkout form after loading tier", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Complete your purchase")).toBeInTheDocument();
    });
  });

  it("displays tier name and price correctly", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("high end")).toBeInTheDocument();
      expect(screen.getByText("$29.00")).toBeInTheDocument();
    });
  });

  it("displays billing period", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("monthly")).toBeInTheDocument();
    });
  });

  it("shows error when tier not found", async () => {
    mockApiRequest.mockResolvedValue({
      success: true,
      data: {
        tiers: [
          {
            id: "pro",
            name: "pro",
            price: 9.99,
            billingPeriod: "monthly" as const,
          },
        ],
      },
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Invalid tier selected")).toBeInTheDocument();
      expect(screen.getByText("Back to Pricing")).toBeInTheDocument();
    });
  });

  it("navigates back to pricing when back button clicked", async () => {
    mockApiRequest.mockResolvedValue({
      success: true,
      data: { tiers: [] },
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      const backButton = screen.getByText("Back to Pricing");
      expect(backButton).toBeInTheDocument();
    });

    const backButton = screen.getByText("Back to Pricing");
    fireEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith("/pricing");
  });

  it("displays Stripe checkout button", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });
  });

  it("initiates Stripe checkout on button click", async () => {
    const mockCheckoutUrl = "https://stripe.com/checkout/test";
    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockResolvedValueOnce({
        success: true,
        data: { checkoutUrl: mockCheckoutUrl },
      });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByText("Pay with Credit Card");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        "/subscriptions/stripe/checkout",
        {
          method: "POST",
          body: { tierId: "pro" },
        },
      );
    });

    await waitFor(() => {
      expect(window.location.href).toBe(mockCheckoutUrl);
    });
  });

  it("shows error message when checkout fails", async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockRejectedValueOnce(new Error("Stripe checkout failed"));

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByText("Pay with Credit Card");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to initiate Stripe checkout. Please try again.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows error when checkout URL not returned", async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockResolvedValueOnce({
        success: true,
        data: null,
      });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByText("Pay with Credit Card");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to initiate Stripe checkout. Please try again.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows loading spinner during checkout", async () => {
    let resolveCheckout: (value: any) => void;
    const checkoutPromise = new Promise((resolve) => {
      resolveCheckout = resolve;
    });

    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockReturnValueOnce(checkoutPromise);

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByText("Pay with Credit Card");
    fireEvent.click(payButton);

    await waitFor(() => {
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    resolveCheckout!({
      success: true,
      data: { checkoutUrl: "https://stripe.com/checkout" },
    });
  });

  it("disables button during checkout", async () => {
    let resolveCheckout: (value: any) => void;
    const checkoutPromise = new Promise((resolve) => {
      resolveCheckout = resolve;
    });

    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockReturnValueOnce(checkoutPromise);

    render(<CheckoutPage />);

    await waitFor(() => {
      const payButton = screen.getByRole("button", {
        name: /pay with credit card/i,
      });
      expect(payButton).not.toBeDisabled();
    });

    const payButton = screen.getByRole("button", {
      name: /pay with credit card/i,
    });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(payButton).toBeDisabled();
    });

    resolveCheckout!({
      success: true,
      data: { checkoutUrl: "https://stripe.com/checkout" },
    });
  });

  it("re-enables button after checkout failure", async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockRejectedValueOnce(new Error("Checkout failed"));

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByText("Pay with Credit Card");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(payButton).not.toBeDisabled();
    });
  });

  it("shows terms of service notice", async () => {
    render(<CheckoutPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/by checking out, you agree to our terms of service/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/payments are securely processed by stripe/i),
      ).toBeInTheDocument();
    });
  });

  it("handles API error when fetching tiers", async () => {
    mockApiRequest.mockRejectedValue(new Error("API Error"));

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load pricing information"),
      ).toBeInTheDocument();
    });
  });

  it("formats price correctly with two decimal places", async () => {
    mockApiRequest.mockResolvedValue({
      success: true,
      data: {
        tiers: [
          {
            id: "pro",
            name: "pro",
            price: 29.5,
            billingPeriod: "monthly" as const,
          },
        ],
      },
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("$29.50")).toBeInTheDocument();
    });
  });

  it("sends correct tierId in checkout request", async () => {
    const mockCheckoutUrl = "https://stripe.com/checkout/test";
    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockResolvedValueOnce({
        success: true,
        data: { checkoutUrl: mockCheckoutUrl },
      });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByText("Pay with Credit Card");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith(
        "/subscriptions/stripe/checkout",
        {
          method: "POST",
          body: { tierId: "pro" },
        },
      );
    });
  });

  it("does not redirect if no checkout URL returned", async () => {
    mockApiRequest
      .mockResolvedValueOnce({
        success: true,
        data: mockTierData,
      })
      .mockResolvedValueOnce({
        success: true,
        data: { checkoutUrl: "" },
      });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Pay with Credit Card")).toBeInTheDocument();
    });

    const payButton = screen.getByRole("button", {
      name: /pay with credit card/i,
    });
    fireEvent.click(payButton);

    // Wait a bit to ensure error message is shown instead of redirect
    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to initiate Stripe checkout. Please try again.",
        ),
      ).toBeInTheDocument();
    });
  });
});

describe("CheckoutPage with different tier configurations", () => {
  it("handles annual billing period", async () => {
    const annualTierData = {
      tiers: [
        {
          id: "pro",
          name: "pro",
          price: 299,
          billingPeriod: "annual" as const,
        },
      ],
    };

    mockApiRequest.mockResolvedValue({
      success: true,
      data: annualTierData,
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("annual")).toBeInTheDocument();
      expect(screen.getByText("$299.00")).toBeInTheDocument();
    });
  });

  it("handles different tier names", async () => {
    const corporateTierData = {
      tiers: [
        {
          id: "corporate",
          name: "corporate",
          price: 199.9,
          billingPeriod: "annual" as const,
        },
      ],
    };

    mockApiRequest.mockResolvedValue({
      success: true,
      data: corporateTierData,
    });

    render(<CheckoutPage />);

    // The component will look for pro but won't find it, showing error
    await waitFor(() => {
      expect(screen.getByText("Invalid tier selected")).toBeInTheDocument();
    });
  });

  it("handles pro tier pricing", async () => {
    const midLevelTierData = {
      tiers: [
        {
          id: "pro",
          name: "pro",
          price: 14.99,
          billingPeriod: "monthly" as const,
        },
      ],
    };

    mockApiRequest.mockResolvedValue({
      success: true,
      data: midLevelTierData,
    });

    render(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("$14.99")).toBeInTheDocument();
    });
  });
});
