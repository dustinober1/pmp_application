/* eslint-disable @typescript-eslint/no-explicit-any -- Test files use any for mocking */
import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { tick } from "svelte";
import CircularProgress from "./CircularProgress.svelte";

describe("CircularProgress Component", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: vi.fn((cb) => {
        return window.setTimeout(() => cb(performance.now()), 16);
      }),
      cancelAnimationFrame: vi.fn(),
      performance: {
        now: () => 0,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(CircularProgress, { percentage: 50, label: "Test Progress" });
      expect(screen.getByText("Test Progress")).toBeInTheDocument();
    });

    it("renders label and description", () => {
      render(CircularProgress, {
        percentage: 75,
        label: "Test Label",
        description: "Test Description",
      });
      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      render(CircularProgress, { percentage: 50, label: "Test" });
      // Check that there's no paragraph element with description text
      const paragraphs = screen.queryAllByText(/./);
      const hasDescription = paragraphs.some(
        (p) => p.tagName === "P" && p.textContent?.length,
      );
      expect(hasDescription).toBe(false);
    });
  });

  describe("SVG Structure", () => {
    it("renders two circles (background and progress)", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const circles = container.querySelectorAll("circle");
      expect(circles.length).toBe(2);
    });

    it("has proper stroke-dasharray attribute", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        size: 120,
        strokeWidth: 8,
      });

      // radius = (120 - 8) / 2 = 56
      // circumference = 2 * PI * 56 ≈ 351.86
      const progressCircle = container.querySelectorAll("circle")[1];
      const dasharray = progressCircle.getAttribute("stroke-dasharray");

      expect(dasharray).toBeCloseTo(351.86, 0);
    });

    it("rotates svg -90 degrees", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("-rotate-90");
    });
  });

  describe("Color Variants", () => {
    it("applies blue color variant by default", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const progressCircle = container.querySelector(
        'circle[stroke="#3b82f6"]',
      );
      expect(progressCircle).toBeInTheDocument();
    });

    it("applies blue color variant explicitly", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        color: "blue",
      });

      const progressCircle = container.querySelector(
        'circle[stroke="#3b82f6"]',
      );
      expect(progressCircle).toBeInTheDocument();
    });

    it("applies purple color variant", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        color: "purple",
      });

      const progressCircle = container.querySelector(
        'circle[stroke="#8b5cf6"]',
      );
      expect(progressCircle).toBeInTheDocument();
    });

    it("applies emerald color variant", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        color: "emerald",
      });

      const progressCircle = container.querySelector(
        'circle[stroke="#10b981"]',
      );
      expect(progressCircle).toBeInTheDocument();
    });

    it("applies amber color variant", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        color: "amber",
      });

      const progressCircle = container.querySelector(
        'circle[stroke="#f59e0b"]',
      );
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe("Size and Stroke Width", () => {
    it("renders with custom size", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        size: 150,
      });

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "150");
      expect(svg).toHaveAttribute("height", "150");
    });

    it("renders with custom stroke width", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        strokeWidth: 12,
      });

      const circles = container.querySelectorAll("circle");
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute("stroke-width", "12");
      });
    });

    it("uses default size when not specified", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "120");
      expect(svg).toHaveAttribute("height", "120");
    });

    it("uses default stroke width when not specified", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const circles = container.querySelectorAll("circle");
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute("stroke-width", "8");
      });
    });
  });

  describe("Show Label Prop", () => {
    it("shows percentage label when showLabel is true (default)", () => {
      render(CircularProgress, {
        percentage: 50,
        label: "Test",
        showLabel: true,
      });

      const percentageText = screen.queryByText("50%");
      expect(percentageText).toBeInTheDocument();
    });

    it("hides percentage label when showLabel is false", () => {
      render(CircularProgress, {
        percentage: 50,
        label: "Test",
        showLabel: false,
      });

      const percentageText = screen.queryByText("50%");
      expect(percentageText).not.toBeInTheDocument();
    });
  });

  describe("Animation on Mount", () => {
    it("starts animation on mount when animate is true", () => {
      const requestAnimationFrameSpy = vi.fn();
      vi.stubGlobal("window", {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        requestAnimationFrame: requestAnimationFrameSpy,
        cancelAnimationFrame: vi.fn(),
        performance: {
          now: () => 0,
        },
      });

      render(CircularProgress, {
        percentage: 75,
        label: "Test",
        animate: true,
      });

      // onMount should trigger requestAnimationFrame for animation
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });

    it("does not animate when animate prop is false", async () => {
      const requestAnimationFrameSpy = vi.fn();
      vi.stubGlobal("window", {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        requestAnimationFrame: requestAnimationFrameSpy,
        cancelAnimationFrame: vi.fn(),
        performance: {
          now: () => 0,
        },
      });

      render(CircularProgress, {
        percentage: 75,
        label: "Test",
        animate: false,
      });

      await tick();

      // Should not call requestAnimationFrame for animation
      expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("maintains proper heading hierarchy for label", () => {
      render(CircularProgress, {
        percentage: 50,
        label: "Progress Label",
      });

      const heading = screen.getByText("Progress Label");
      expect(heading.tagName).toBe("H3");
    });
  });

  describe("Progress Circle Offset", () => {
    it("calculates correct stroke-dashoffset for 0%", () => {
      const { container } = render(CircularProgress, {
        percentage: 0,
        label: "Test",
        animate: false,
      });

      const progressCircle = container.querySelectorAll("circle")[1];
      const dasharray = parseFloat(
        progressCircle.getAttribute("stroke-dasharray") || "0",
      );
      const offset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // For 0%, offset should equal circumference (full circle)
      expect(offset).toBeCloseTo(dasharray, 0);
    });

    it("calculates correct stroke-dashoffset for 50%", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        animate: false,
      });

      const progressCircle = container.querySelectorAll("circle")[1];
      const dasharray = parseFloat(
        progressCircle.getAttribute("stroke-dasharray") || "0",
      );
      const offset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // For 50%, offset should be half of circumference
      expect(offset).toBeCloseTo(dasharray / 2, 0);
    });

    it("calculates correct stroke-dashoffset for 100%", () => {
      const { container } = render(CircularProgress, {
        percentage: 100,
        label: "Test",
        animate: false,
      });

      const progressCircle = container.querySelectorAll("circle")[1];
      const offset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // For 100%, offset should be 0 (full progress)
      expect(offset).toBeCloseTo(0, 0);
    });
  });

  describe("Edge Cases", () => {
    it("handles percentage values above 100", () => {
      const { container } = render(CircularProgress, {
        percentage: 150,
        label: "Test",
        animate: false,
      });

      // The component doesn't clamp, so it will calculate beyond full
      const progressCircle = container.querySelectorAll("circle")[1];
      const offset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // Should be negative (beyond full circle)
      expect(offset).toBeLessThan(0);
    });

    it("handles negative percentage values", () => {
      const { container } = render(CircularProgress, {
        percentage: -10,
        label: "Test",
        animate: false,
      });

      const progressCircle = container.querySelectorAll("circle")[1];
      const dasharray = parseFloat(
        progressCircle.getAttribute("stroke-dasharray") || "0",
      );
      const offset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // Should be more than circumference (less than empty)
      expect(offset).toBeGreaterThan(dasharray);
    });

    it("handles zero percentage", () => {
      render(CircularProgress, {
        percentage: 0,
        label: "Test",
        animate: false,
      });

      const percentageText = screen.queryByText("0%");
      expect(percentageText).toBeInTheDocument();
    });

    it("handles boundary value of 100", () => {
      render(CircularProgress, {
        percentage: 100,
        label: "Test",
        animate: false,
      });

      const percentageText = screen.queryByText("100%");
      expect(percentageText).toBeInTheDocument();
    });

    it("handles decimal percentage values", () => {
      render(CircularProgress, {
        percentage: 75.7,
        label: "Test",
        animate: false,
      });

      // Should round to nearest integer
      const percentageText = screen.queryByText("76%");
      expect(percentageText).toBeInTheDocument();
    });
  });

  describe("Derived State Reactivity", () => {
    it("updates offset calculation when percentage changes", async () => {
      const { container, component } = render(CircularProgress, {
        percentage: 25,
        label: "Test",
        animate: false,
      });

      const progressCircle = container.querySelectorAll("circle")[1];
      const initialOffset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // @ts-ignore - testing prop change
      component.$set({ percentage: 75 });
      await tick();

      const updatedOffset = parseFloat(
        progressCircle.getAttribute("stroke-dashoffset") || "0",
      );

      // Offset should decrease as percentage increases
      expect(updatedOffset).toBeLessThan(initialOffset);
    });

    it("updates color when color prop changes", async () => {
      const { container, component } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        color: "blue",
      });

      let progressCircle = container.querySelector('circle[stroke="#3b82f6"]');
      expect(progressCircle).toBeInTheDocument();

      // @ts-ignore - testing prop change
      component.$set({ color: "purple" });
      await tick();

      progressCircle = container.querySelector('circle[stroke="#8b5cf6"]');
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("renders percentage with proper text color class", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
        color: "blue",
        showLabel: true,
      });

      const percentageText = container.querySelector("span");
      expect(percentageText).toHaveClass("text-blue-600", "dark:text-blue-400");
    });

    it("has proper filter styling on SVG", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const svg = container.querySelector("svg");
      const style = svg?.getAttribute("style");
      expect(style).toContain("drop-shadow");
    });

    it("background circle uses proper stroke color", () => {
      const { container } = render(CircularProgress, {
        percentage: 50,
        label: "Test",
      });

      const backgroundCircle = container.querySelectorAll("circle")[0];
      expect(backgroundCircle).toHaveClass(
        "text-gray-200",
        "dark:text-gray-700",
      );
    });
  });
});
