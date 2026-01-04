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

  it("renders Product section with correct links", () => {
    render(Footer);

    // Check section title
    expect(screen.getByText("Product")).toBeInTheDocument();

    // Check links
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
  });

  it("renders Resources section with correct links", () => {
    render(Footer);

    // Check section title
    expect(screen.getByText("Resources")).toBeInTheDocument();

    // Check links
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Study Guide")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders Legal section with correct links", () => {
    render(Footer);

    // Check section title
    expect(screen.getByText("Legal")).toBeInTheDocument();

    // Check links
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders copyright notice with current year", () => {
    render(Footer);
    expect(screen.getByText(/© 2025 PMP Study Pro/)).toBeInTheDocument();
  });

  it("all footer links have correct href attributes", () => {
    render(Footer);

    // Product links
    const featuresLink = screen.getByText("Features").closest("a");
    expect(featuresLink).toHaveAttribute("href", "/#features");

    const pricingLink = screen.getByText("Pricing").closest("a");
    expect(pricingLink).toHaveAttribute("href", "/pricing");

    const testimonialsLink = screen.getByText("Testimonials").closest("a");
    expect(testimonialsLink).toHaveAttribute("href", "/#testimonials");

    // Resources links
    const blogLink = screen.getByText("Blog").closest("a");
    expect(blogLink).toHaveAttribute("href", "/blog");

    const studyGuideLink = screen.getByText("Study Guide").closest("a");
    expect(studyGuideLink).toHaveAttribute("href", "/study-guide");

    const faqLink = screen.getByText("FAQ").closest("a");
    expect(faqLink).toHaveAttribute("href", "/faq");

    // Legal links
    const privacyLink = screen.getByText("Privacy Policy").closest("a");
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    const termsLink = screen.getByText("Terms of Service").closest("a");
    expect(termsLink).toHaveAttribute("href", "/terms");

    const contactLink = screen.getByText("Contact").closest("a");
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("has proper accessibility attributes", () => {
    render(Footer);

    const homeLink = screen.getByLabelText("PMP Study Pro - Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
