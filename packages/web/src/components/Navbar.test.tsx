/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock i18n before any component imports
vi.mock("@/i18n/i18n", () => ({
  t: (key: string) => key,
  setLocale: vi.fn(),
  getLocale: () => "en",
  supportedLocales: ["en", "es"],
  SUPPORTED_LOCALES: ["en", "es"],
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

// Mock useAuth hook
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock SearchDialog since it might use other contexts
vi.mock("./SearchDialog", () => ({
  default: ({
    setOpen,
  }: {
    open: boolean;
    setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  }) => (
    <div data-testid="search-dialog">
      <button onClick={() => setOpen(false)}>Close</button>
    </div>
  ),
}));

// Mock next/navigation with usePathname for active link highlighting
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { Navbar } from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

describe("Navbar Component", () => {
  // MEDIUM-004: Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock ThemeProvider
    vi.mock("@/components/ThemeProvider", () => ({
      setStoredTheme: vi.fn(),
    }));
    // Mock document.documentElement.classList
    Object.defineProperty(document.documentElement, "classList", {
      value: {
        contains: vi.fn(() => false),
      },
      writable: true,
    });
  });

  describe("Basic Rendering", () => {
    it("renders logo and brand name", () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });
      (usePathname as any).mockReturnValue("/");
      render(<Navbar />);
      expect(screen.getByText("PMP Study Pro")).toBeInTheDocument();
      // Check for PM logo
      expect(screen.getByText("PM")).toBeInTheDocument();
    });

    it("renders login and get started buttons when not authenticated", () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });
      (usePathname as any).mockReturnValue("/");
      render(<Navbar />);
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("does not render navigation links when not authenticated", () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });
      (usePathname as any).mockReturnValue("/");
      render(<Navbar />);
      expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
      expect(screen.queryByText("Study")).not.toBeInTheDocument();
    });
  });

  describe("Authenticated User Rendering", () => {
    const mockUser = {
      name: "Test User",
      tier: "free",
      email: "test@example.com",
    };

    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        logout: vi.fn(),
      });
      (usePathname as any).mockReturnValue("/dashboard");
    });

    it("renders user info when authenticated", () => {
      render(<Navbar />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("free Tier")).toBeInTheDocument();
    });

    it("renders desktop navigation links when authenticated", () => {
      render(<Navbar />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Study")).toBeInTheDocument();
      expect(screen.getByText("Flashcards")).toBeInTheDocument();
      expect(screen.getByText("Practice")).toBeInTheDocument();
      expect(screen.getByText("Formulas")).toBeInTheDocument();
    });

    it("renders search button when authenticated", () => {
      render(<Navbar />);
      const searchButton = screen.getByLabelText("Search");
      expect(searchButton).toBeInTheDocument();
    });

    it("opens search dialog with keyboard shortcut", async () => {
      render(<Navbar />);
      expect(screen.queryByTestId("search-dialog")).not.toBeInTheDocument();

      fireEvent.keyDown(window, { key: "k", metaKey: true });

      await waitFor(() =>
        expect(screen.getByTestId("search-dialog")).toBeInTheDocument(),
      );
    });

    it("renders logout button when authenticated", () => {
      render(<Navbar />);
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });

  describe("Active Link Highlighting (HIGH-006)", () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { name: "Test User", tier: "free" },
      });
    });

    it("highlights dashboard link when on dashboard page", () => {
      (usePathname as any).mockReturnValue("/dashboard");
      render(<Navbar />);
      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveClass("text-[var(--primary)]");
    });

    it("highlights study link when on study page", () => {
      (usePathname as any).mockReturnValue("/study");
      render(<Navbar />);
      const studyLink = screen.getByText("Study").closest("a");
      expect(studyLink).toHaveClass("text-[var(--primary)]");
    });

    it("highlights flashcards link when on flashcards page", () => {
      (usePathname as any).mockReturnValue("/flashcards");
      render(<Navbar />);
      const flashcardsLink = screen.getByText("Flashcards").closest("a");
      expect(flashcardsLink).toHaveClass("text-[var(--primary)]");
    });

    it("highlights practice link when on practice page", () => {
      (usePathname as any).mockReturnValue("/practice");
      render(<Navbar />);
      const practiceLink = screen.getByText("Practice").closest("a");
      expect(practiceLink).toHaveClass("text-[var(--primary)]");
    });

    it("highlights formulas link when on formulas page", () => {
      (usePathname as any).mockReturnValue("/formulas");
      render(<Navbar />);
      const formulasLink = screen.getByText("Formulas").closest("a");
      expect(formulasLink).toHaveClass("text-[var(--primary)]");
    });

    it("highlights study link for nested study routes", () => {
      (usePathname as any).mockReturnValue("/study/some-task-id");
      render(<Navbar />);
      const studyLink = screen.getByText("Study").closest("a");
      expect(studyLink).toHaveClass("text-[var(--primary)]");
    });

    it("does not highlight dashboard when on other pages", () => {
      (usePathname as any).mockReturnValue("/study");
      render(<Navbar />);
      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveClass("text-[var(--foreground-muted)]");
      expect(dashboardLink).not.toHaveClass("text-[var(--primary)]");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { name: "Test User", tier: "free" },
      });
      (usePathname as any).mockReturnValue("/dashboard");
    });

    it("renders mobile menu button when authenticated", () => {
      render(<Navbar />);
      const menuButton = screen.getByLabelText(/Open navigation menu/i);
      expect(menuButton).toBeInTheDocument();
    });

    it("does not show mobile navigation by default", () => {
      render(<Navbar />);
      const mobileNav = document.getElementById("mobile-navigation");
      expect(mobileNav).not.toBeInTheDocument();
    });

    it("opens mobile menu when button is clicked", () => {
      render(<Navbar />);
      const menuButton = screen.getByLabelText(/Open navigation menu/i);
      fireEvent.click(menuButton);

      waitFor(() => {
        const mobileNav = document.getElementById("mobile-navigation");
        expect(mobileNav).toBeInTheDocument();
      });
    });

    it("closes mobile menu when button is clicked again", () => {
      render(<Navbar />);
      const menuButton = screen.getByLabelText(/Open navigation menu/i);

      // Open menu
      fireEvent.click(menuButton);

      waitFor(() => {
        const closeButton = screen.getByLabelText(/Close navigation menu/i);
        expect(closeButton).toBeInTheDocument();

        // Close menu
        fireEvent.click(closeButton);
        const mobileNav = document.getElementById("mobile-navigation");
        expect(mobileNav).not.toBeInTheDocument();
      });
    });

    it("highlights active link in mobile navigation", () => {
      (usePathname as any).mockReturnValue("/study");
      render(<Navbar />);
      const menuButton = screen.getByLabelText(/Open navigation menu/i);
      fireEvent.click(menuButton);

      waitFor(() => {
        const studyLink = screen.getByText("Study").closest("a");
        expect(studyLink).toHaveClass("text-[var(--primary)]");
      });
    });
  });

  describe("Dark Mode Toggle", () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { name: "Test User", tier: "free" },
      });
      (usePathname as any).mockReturnValue("/dashboard");

      // Mock dark mode
      Object.defineProperty(document.documentElement, "classList", {
        value: {
          contains: vi.fn((cls: string) => cls === "dark"),
        },
        writable: true,
      });
    });

    it("renders dark mode toggle button", () => {
      render(<Navbar />);
      const darkModeButton = screen.getByLabelText(
        /Switch to dark mode|Switch to light mode/i,
      );
      expect(darkModeButton).toBeInTheDocument();
    });
  });

  describe("Language Toggle", () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { name: "Test User", tier: "free" },
      });
      (usePathname as any).mockReturnValue("/dashboard");
    });

    it("renders language toggle button", () => {
      render(<Navbar />);
      const langButton = screen.getByLabelText("Change language");
      expect(langButton).toBeInTheDocument();
    });

    it("displays current locale", () => {
      render(<Navbar />);
      expect(screen.getByText("EN")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { name: "Test User", tier: "free" },
      });
      (usePathname as any).mockReturnValue("/dashboard");
    });

    it("has proper ARIA labels for interactive elements", () => {
      render(<Navbar />);
      expect(screen.getByLabelText("Search")).toBeInTheDocument();
      expect(screen.getByLabelText("Change language")).toBeInTheDocument();
      expect(screen.getByLabelText(/Switch to .* mode/i)).toBeInTheDocument();
    });

    it("has proper aria-expanded for mobile menu button", () => {
      render(<Navbar />);
      const menuButton = screen.getByLabelText(/Open navigation menu/i);
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });

    it("has aria-controls referencing mobile navigation", () => {
      render(<Navbar />);
      const menuButton = screen.getByLabelText(/Open navigation menu/i);
      expect(menuButton).toHaveAttribute("aria-controls", "mobile-navigation");
    });
  });
});
