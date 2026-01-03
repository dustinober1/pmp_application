import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

import { SkipToContentLink } from "./SkipToContentLink";

describe("SkipToContentLink Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toBeInTheDocument();
  });

  it("has correct href attribute", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("has screen reader only class by default", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveClass("sr-only");
  });

  it("has focus visible styling classes", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveClass("focus:not-sr-only");
    expect(link).toHaveClass("focus:absolute");
    expect(link).toHaveClass("focus:top-4");
    expect(link).toHaveClass("focus:left-4");
    expect(link).toHaveClass("focus:z-[200]");
  });

  it("has focus styling for appearance", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toHaveClass("focus:px-4");
    expect(link).toHaveClass("focus:py-2");
    expect(link).toHaveClass("focus:rounded-lg");
  });

  it("has focus color styling", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.className).toContain("focus:bg-[var(--primary)]");
    expect(link).toHaveClass("focus:text-white");
  });

  it("renders as an anchor element", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.tagName).toBe("A");
  });

  it("displays translated text", () => {
    render(<SkipToContentLink />);
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
  });

  it("is accessible to screen readers", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAccessibleName("Skip to main content");
  });

  it("links to main content landmark", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.getAttribute("href")).toBe("#main-content");
  });

  it("becomes visible when focused (has focus:not-sr-only)", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("has high z-index when focused to overlay content", () => {
    render(<SkipToContentLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    expect(link.className).toContain("focus:z-[200]");
  });
});
