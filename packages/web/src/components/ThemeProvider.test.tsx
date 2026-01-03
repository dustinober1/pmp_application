import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Create a mock localStorage before importing the component
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((_index: number) => null),
    length: 0,
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
    _getStore: () => store,
  };
};

describe("ThemeProvider Component", () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;
  let originalLocalStorage: Storage;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    originalLocalStorage = globalThis.localStorage;
    originalMatchMedia = window.matchMedia;

    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    });
    document.documentElement.classList.remove("dark");
    vi.resetModules();
  });

  it("renders children correctly", async () => {
    const { ThemeProvider } = await import("./ThemeProvider");
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("applies stored dark theme on mount", async () => {
    localStorageMock._setStore({ pmp_theme: "dark" });

    const { ThemeProvider } = await import("./ThemeProvider");
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("applies stored light theme on mount", async () => {
    localStorageMock._setStore({ pmp_theme: "light" });

    const { ThemeProvider } = await import("./ThemeProvider");
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  it("uses system preference when no stored theme", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { ThemeProvider } = await import("./ThemeProvider");
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("defaults to light theme when no preference and no stored theme", async () => {
    const { ThemeProvider } = await import("./ThemeProvider");
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });

  it("renders nested components correctly", async () => {
    const { ThemeProvider } = await import("./ThemeProvider");
    render(
      <ThemeProvider>
        <div data-testid="parent">
          <span data-testid="nested">Nested Content</span>
        </div>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("parent")).toBeInTheDocument();
    expect(screen.getByTestId("nested")).toBeInTheDocument();
  });
});

describe("getStoredTheme", () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    originalLocalStorage = globalThis.localStorage;

    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    vi.resetModules();
  });

  it("returns null when no theme stored", async () => {
    const { getStoredTheme } = await import("./ThemeProvider");
    expect(getStoredTheme()).toBeNull();
  });

  it("returns dark when dark theme is stored", async () => {
    localStorageMock._setStore({ pmp_theme: "dark" });
    const { getStoredTheme } = await import("./ThemeProvider");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns light when light theme is stored", async () => {
    localStorageMock._setStore({ pmp_theme: "light" });
    const { getStoredTheme } = await import("./ThemeProvider");
    expect(getStoredTheme()).toBe("light");
  });

  it("returns null for invalid stored values", async () => {
    localStorageMock._setStore({ pmp_theme: "invalid" });
    const { getStoredTheme } = await import("./ThemeProvider");
    expect(getStoredTheme()).toBeNull();
  });
});

describe("setStoredTheme", () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;
  let originalLocalStorage: Storage;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    originalLocalStorage = globalThis.localStorage;

    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    document.documentElement.classList.remove("dark");
    vi.resetModules();
  });

  it("stores and applies dark theme", async () => {
    const { setStoredTheme } = await import("./ThemeProvider");
    setStoredTheme("dark");

    expect(localStorageMock.setItem).toHaveBeenCalledWith("pmp_theme", "dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("stores and applies light theme", async () => {
    document.documentElement.classList.add("dark");
    const { setStoredTheme } = await import("./ThemeProvider");
    setStoredTheme("light");

    expect(localStorageMock.setItem).toHaveBeenCalledWith("pmp_theme", "light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
