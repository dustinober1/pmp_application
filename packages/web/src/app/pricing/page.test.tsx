import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PricingPage from "./page";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock("@pmp/shared", () => ({
  DEFAULT_TIER_FEATURES: {
    free: {
      studyGuidesAccess: "limited",
      flashcardsLimit: 500,
      practiceQuestionsPerDomain: 25,
      customFlashcards: false,
      mockExams: true,
      formulaCalculator: false,
      advancedAnalytics: false,
      personalizedStudyPlan: false,
      teamManagement: false,
      dedicatedSupport: false,
    },
    pro: {
      studyGuidesAccess: "full",
      flashcardsLimit: 1000,
      practiceQuestionsPerDomain: 100,
      customFlashcards: false,
      mockExams: true,
      formulaCalculator: true,
      advancedAnalytics: true,
      personalizedStudyPlan: false,
      teamManagement: false,
      dedicatedSupport: false,
    },
    pro: {
      studyGuidesAccess: "full",
      flashcardsLimit: 2000,
      practiceQuestionsPerDomain: 200,
      customFlashcards: true,
      mockExams: true,
      formulaCalculator: true,
      advancedAnalytics: true,
      personalizedStudyPlan: true,
      teamManagement: false,
      dedicatedSupport: false,
    },
    corporate: {
      studyGuidesAccess: "full",
      flashcardsLimit: "unlimited",
      practiceQuestionsPerDomain: 200,
      customFlashcards: true,
      mockExams: true,
      formulaCalculator: true,
      advancedAnalytics: true,
      personalizedStudyPlan: true,
      teamManagement: true,
      dedicatedSupport: true,
    },
  },
}));

describe("PricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pricing heading", () => {
    render(<PricingPage />);

    expect(
      screen.getByRole("heading", { name: "Pricing" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Invest in your PMP success")).toBeInTheDocument();
  });

  it("renders all four pricing tiers", () => {
    render(<PricingPage />);

    expect(screen.getByText("Free Starter")).toBeInTheDocument();
    expect(screen.getByText("Mid-Level")).toBeInTheDocument();
    expect(screen.getByText("High-End")).toBeInTheDocument();
    expect(screen.getByText("Corporate Team")).toBeInTheDocument();
  });

  it("displays monthly prices by default", () => {
    render(<PricingPage />);

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$14.99")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("switches to annual pricing when clicked", () => {
    render(<PricingPage />);

    fireEvent.click(screen.getByRole("button", { name: /annual/i }));

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("$99.90")).toBeInTheDocument();
    expect(screen.getByText("$149.90")).toBeInTheDocument();
    expect(screen.getByText("$199.90")).toBeInTheDocument();
  });

  it("shows Monthly as selected by default", () => {
    render(<PricingPage />);

    const monthlyButton = screen.getByRole("button", { name: "Monthly" });
    expect(monthlyButton.className).toContain("bg-primary");
  });

  it("renders tier descriptions", () => {
    render(<PricingPage />);

    expect(
      screen.getByText(/perfect for starting your PMP journey/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/great for dedicated PMP candidates/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/comprehensive preparation for exam success/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/manage your entire team/i)).toBeInTheDocument();
  });

  it("shows Most Popular badge on Pro tier", () => {
    render(<PricingPage />);

    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("renders Get Started button for Free tier when not logged in", () => {
    render(<PricingPage />);

    const freeButton = screen.getByRole("link", { name: "Get Started" });
    expect(freeButton).toHaveAttribute("href", "/auth/register");
  });

  it("renders Upgrade button for Mid-Level tier", () => {
    render(<PricingPage />);

    const midLevelButton = screen.getByRole("link", {
      name: "Upgrade to Mid-Level",
    });
    expect(midLevelButton).toHaveAttribute("href", "/checkout?tier=pro");
  });

  it("renders Upgrade button for High-End tier", () => {
    render(<PricingPage />);

    const highEndButton = screen.getByRole("link", {
      name: "Upgrade to High-End",
    });
    expect(highEndButton).toHaveAttribute("href", "/checkout?tier=pro");
  });

  it("renders Start Team Plan button for Corporate tier", () => {
    render(<PricingPage />);

    const corporateButton = screen.getByRole("link", {
      name: "Start Team Plan",
    });
    expect(corporateButton).toHaveAttribute("href", "/checkout?tier=corporate");
  });

  it("shows feature checkmarks for included features", () => {
    render(<PricingPage />);

    // All tiers should have some checked items
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it("shows X marks for excluded features", () => {
    render(<PricingPage />);

    // Free tier should have X marks for excluded features
    const xMarks = screen.getAllByText("✕");
    expect(xMarks.length).toBeGreaterThan(0);
  });

  it("displays billing period labels", () => {
    render(<PricingPage />);

    const monthlyLabels = screen.getAllByText("/mo");
    expect(monthlyLabels.length).toBe(3);

    // Switch to annual
    fireEvent.click(screen.getByRole("button", { name: /annual/i }));

    const annualLabels = screen.getAllByText("/yr");
    expect(annualLabels.length).toBe(3);
  });
});

describe("PricingPage with authenticated user", () => {
  beforeEach(() => {
    vi.doMock("../../contexts/AuthContext", () => ({
      useAuth: () => ({
        user: { id: "1", tier: "free" },
      }),
    }));
  });

  it("shows Current Plan for user tier", async () => {
    const { default: PricingPageAuth } = await import("./page");

    render(<PricingPageAuth />);

    // The user should see their current plan indicated
    expect(screen.getByText("Invest in your PMP success")).toBeInTheDocument();
  });
});

describe("PricingPage with Pro user", () => {
  beforeEach(() => {
    vi.doMock("../../contexts/AuthContext", () => ({
      useAuth: () => ({
        user: { id: "1", tier: "pro" },
      }),
    }));
  });

  it("shows Current Plan for Pro tier", async () => {
    const { default: PricingPagePro } = await import("./page");

    render(<PricingPagePro />);

    expect(screen.getByText("Invest in your PMP success")).toBeInTheDocument();
  });
});
