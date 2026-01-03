import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton Component", () => {
  it("renders without crashing", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("applies default skeleton styles", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded");
    expect(skeleton).toHaveClass("bg-gray-800/60");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-full" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("h-8");
    expect(skeleton).toHaveClass("w-full");
  });

  it("preserves default classes when adding custom className", () => {
    const { container } = render(<Skeleton className="h-10" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("rounded");
    expect(skeleton).toHaveClass("bg-gray-800/60");
    expect(skeleton).toHaveClass("h-10");
  });

  it("renders with empty className", () => {
    const { container } = render(<Skeleton className="" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("applies width class correctly", () => {
    const { container } = render(<Skeleton className="w-32" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("w-32");
  });

  it("applies height class correctly", () => {
    const { container } = render(<Skeleton className="h-16" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("h-16");
  });

  it("accepts multiple custom classes", () => {
    const { container } = render(<Skeleton className="h-8 w-56 mt-4 mb-2" />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("h-8");
    expect(skeleton).toHaveClass("w-56");
    expect(skeleton).toHaveClass("mt-4");
    expect(skeleton).toHaveClass("mb-2");
  });

  it("has animate-pulse for loading animation", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("has rounded corners", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton).toHaveClass("rounded");
  });

  it("has semi-transparent dark background", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("div");
    expect(skeleton?.className).toContain("bg-gray-800/60");
  });

  it("renders as a div element", () => {
    const { container } = render(<Skeleton />);
    const element = container.firstChild;
    expect(element?.nodeName).toBe("DIV");
  });
});
