import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "./page";
import { vi, describe, it, expect, afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("HomePage", () => {
  it("renders hero section with main heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /pass the 2026 pmp exam/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/with confidence/i)).toBeInTheDocument();
  });

  it("renders hero description text", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/comprehensive study materials, practice questions/i),
    ).toBeInTheDocument();
  });

  it("renders call-to-action buttons in hero", () => {
    render(<HomePage />);

    const registerLinks = screen.getAllByRole("link", {
      name: /start free trial/i,
    });
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(registerLinks[0]).toHaveAttribute("href", "/auth/register");

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/auth/login",
    );
  });

  it("renders features section with all features", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /everything you need to pass/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Comprehensive Study Guides")).toBeInTheDocument();
    expect(screen.getByText("1,800+ Practice Questions")).toBeInTheDocument();
    expect(
      screen.getByText("Spaced Repetition Flashcards"),
    ).toBeInTheDocument();
    expect(screen.getByText("Formula Calculator")).toBeInTheDocument();
    expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Full Mock Exams")).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/in-depth coverage of all pmp domains/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/realistic exam questions with detailed explanations/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/optimize your memory with our sm-2 algorithm/i),
    ).toBeInTheDocument();
  });

  it("renders stats section with all statistics", () => {
    render(<HomePage />);

    expect(screen.getByText("Adaptive")).toBeInTheDocument();
    expect(screen.getByText("Learning Algorithm")).toBeInTheDocument();
    expect(screen.getByText("1,200+")).toBeInTheDocument();
    expect(screen.getAllByText(/1,800\+/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("SM-2")).toBeInTheDocument();
    expect(screen.getByText("Spaced Repetition")).toBeInTheDocument();
  });

  it("renders pricing section with all tiers", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /simple, transparent pricing/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Free Starter")).toBeInTheDocument();
    expect(screen.getByText("Mid-Level")).toBeInTheDocument();
    expect(screen.getByText("High-End")).toBeInTheDocument();
    expect(screen.getByText("Corporate")).toBeInTheDocument();
  });

  it("renders pricing with correct prices", () => {
    render(<HomePage />);

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$14.99")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("shows most popular badge on High-End tier", () => {
    render(<HomePage />);

    expect(screen.getByText("Most Popular")).toBeInTheDocument();
  });

  it("renders pricing tier features", () => {
    render(<HomePage />);

    expect(screen.getByText("500+ flashcards")).toBeInTheDocument();
    expect(screen.getByText("1 full-length practice exam")).toBeInTheDocument();
    expect(screen.getByText("All Free features")).toBeInTheDocument();
    expect(screen.getByText("1,000+ flashcards")).toBeInTheDocument();
    expect(
      screen.getByText("3 full-length practice exams"),
    ).toBeInTheDocument();
    expect(screen.getByText("2,000+ flashcards")).toBeInTheDocument();
    expect(
      screen.getByText("6 full-length practice exams"),
    ).toBeInTheDocument();
    expect(screen.getByText("Team management")).toBeInTheDocument();
    expect(screen.getByText("Dedicated support")).toBeInTheDocument();
  });

  it("renders get started links for each tier", () => {
    render(<HomePage />);

    const getStartedLinks = screen.getAllByRole("link", {
      name: /get started/i,
    });
    expect(getStartedLinks).toHaveLength(4);
    getStartedLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/auth/register");
    });
  });

  it("renders CTA section", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /ready to ace your pmp exam/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /join thousands of successful pmp-certified professionals/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders footer with branding", () => {
    render(<HomePage />);

    expect(screen.getByText("PM")).toBeInTheDocument();
    expect(screen.getByText("PMP Study Pro")).toBeInTheDocument();
    expect(screen.getByText(/© 2026 pmp study pro/i)).toBeInTheDocument();
  });

  it("renders page with correct structure", () => {
    const { container } = render(<HomePage />);

    expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
    expect(container.querySelectorAll("section").length).toBeGreaterThanOrEqual(
      4,
    );
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
