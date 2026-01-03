import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock modules with inline factory functions to avoid hoisting issues
vi.mock("@/i18n/i18n", () => {
  const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
  return {
    default: {
      language: "en",
      changeLanguage: mockChangeLanguage,
      isInitialized: true,
      use: vi.fn().mockReturnThis(),
      init: vi.fn().mockResolvedValue(undefined),
      t: (key: string) => key,
    },
    getInitialLocale: vi.fn(() => "en"),
    SUPPORTED_LOCALES: ["en", "es"],
    setLocale: vi.fn(),
  };
});

vi.mock("react-i18next", () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="i18next-provider">{children}</div>
  ),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

import { I18nProvider } from "./I18nProvider";
import i18n, { getInitialLocale } from "@/i18n/i18n";

describe("I18nProvider Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (i18n as { language: string }).language = "en";
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders children correctly", () => {
    render(
      <I18nProvider>
        <div data-testid="child">Test Child</div>
      </I18nProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("wraps children in I18nextProvider", () => {
    render(
      <I18nProvider>
        <span>Content</span>
      </I18nProvider>,
    );

    expect(screen.getByTestId("i18next-provider")).toBeInTheDocument();
  });

  it("changes language when initial locale differs from i18n language", async () => {
    vi.mocked(getInitialLocale).mockReturnValue("es");
    (i18n as { language: string }).language = "en";

    render(
      <I18nProvider>
        <div>Content</div>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(i18n.changeLanguage).toHaveBeenCalledWith("es");
    });
  });

  it("does not change language when initial locale matches i18n language", async () => {
    vi.mocked(getInitialLocale).mockReturnValue("en");
    (i18n as { language: string }).language = "en";

    render(
      <I18nProvider>
        <div>Content</div>
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(i18n.changeLanguage).not.toHaveBeenCalled();
    });
  });

  it("renders nested components correctly", () => {
    render(
      <I18nProvider>
        <div data-testid="parent">
          <span data-testid="nested">Nested Content</span>
        </div>
      </I18nProvider>,
    );

    expect(screen.getByTestId("parent")).toBeInTheDocument();
    expect(screen.getByTestId("nested")).toBeInTheDocument();
    expect(screen.getByText("Nested Content")).toBeInTheDocument();
  });

  it("renders multiple children correctly", () => {
    render(
      <I18nProvider>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </I18nProvider>,
    );

    expect(screen.getByTestId("first")).toBeInTheDocument();
    expect(screen.getByTestId("second")).toBeInTheDocument();
  });
});
