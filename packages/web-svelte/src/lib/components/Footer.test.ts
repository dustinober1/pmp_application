import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Footer from "./Footer.svelte";

describe("Footer Component", () => {
  beforeEach(() => {
    // Mock current year for consistent testing
    vi.spyOn(Date.prototype, "getFullYear").mockReturnValue(2025);
  });

  it("renders company logo and name", () => {
    render(Footer);
    expect(screen.getByText("PMP Study Pro")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("renders company description", () => {
    render(Footer);
    expect(
      screen.getByText(
        "Comprehensive PMP exam preparation with adaptive learning and real-time analytics.",
      ),
    ).toBeInTheDocument();
  });

  it("renders Resources section with correct links", () => {
    render(Footer);

    // Check section title
    expect(screen.getByText("Resources")).toBeInTheDocument();

    // Check links
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders Legal section with correct links", () => {
    render(Footer);

    // Check section title
    expect(screen.getByText("Legal")).toBeInTheDocument();

    // Check links
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders copyright notice with current year", () => {
    render(Footer);
    expect(screen.getByText(/© 2025 PMP Study Pro/)).toBeInTheDocument();
  });

  it("all footer links have correct href attributes", () => {
    render(Footer);

    // Resources links
    const faqLink = screen.getByText("FAQ").closest("a");
    expect(faqLink).toHaveAttribute("href", "/pmp_application/faq");

    // Legal links
    const privacyLink = screen.getByText("Privacy Policy").closest("a");
    expect(privacyLink).toHaveAttribute("href", "/pmp_application/privacy");

    const termsLink = screen.getByText("Terms of Service").closest("a");
    expect(termsLink).toHaveAttribute("href", "/pmp_application/terms");
  });

  it("has proper accessibility attributes", () => {
    render(Footer);

    const homeLink = screen.getByLabelText("PMP Study Pro - Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
