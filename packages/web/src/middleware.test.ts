import { describe, it, expect, vi, beforeEach } from "vitest";
import { middleware, config } from "./middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: "next" })),
      redirect: vi.fn((url: URL) => ({
        type: "redirect",
        url: url.toString(),
      })),
    },
  };
});

function createMockRequest(
  pathname: string,
  cookies: Record<string, string> = {},
): NextRequest {
  const searchParams = new URLSearchParams();
  return {
    nextUrl: {
      pathname,
      clone: () => ({
        pathname: "/auth/login",
        searchParams,
        set pathname(value: string) {
          // stub
        },
      }),
    },
    cookies: {
      get: (name: string) =>
        cookies[name] ? { value: cookies[name] } : undefined,
    },
  } as unknown as NextRequest;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("public paths", () => {
    it("allows access to home page without auth", () => {
      const request = createMockRequest("/");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to pricing page without auth", () => {
      const request = createMockRequest("/pricing");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to offline page without auth", () => {
      const request = createMockRequest("/offline");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to auth routes without auth", () => {
      const request = createMockRequest("/auth/login");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to auth register without auth", () => {
      const request = createMockRequest("/auth/register");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to _next routes", () => {
      const request = createMockRequest("/_next/static/chunk.js");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to favicon", () => {
      const request = createMockRequest("/favicon.ico");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe("protected paths without auth", () => {
    it("redirects from dashboard to login when not authenticated", () => {
      const request = createMockRequest("/dashboard");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects from study to login when not authenticated", () => {
      const request = createMockRequest("/study");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects from flashcards to login when not authenticated", () => {
      const request = createMockRequest("/flashcards");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects from practice to login when not authenticated", () => {
      const request = createMockRequest("/practice");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects from formulas to login when not authenticated", () => {
      const request = createMockRequest("/formulas");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects from team to login when not authenticated", () => {
      const request = createMockRequest("/team");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });

    it("redirects nested protected paths", () => {
      const request = createMockRequest("/study/domain/123");
      middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });

  describe("protected paths with auth", () => {
    it("allows access to dashboard when authenticated", () => {
      const request = createMockRequest("/dashboard", {
        pmp_access_token: "valid-token",
      });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to study when authenticated", () => {
      const request = createMockRequest("/study", {
        pmp_access_token: "valid-token",
      });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to flashcards when authenticated", () => {
      const request = createMockRequest("/flashcards", {
        pmp_access_token: "valid-token",
      });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to nested protected paths when authenticated", () => {
      const request = createMockRequest("/practice/quiz/123", {
        pmp_access_token: "valid-token",
      });
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe("non-protected paths", () => {
    it("allows access to unknown routes without auth", () => {
      const request = createMockRequest("/some-unknown-page");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it("allows access to API routes without auth check", () => {
      const request = createMockRequest("/api/health");
      middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
    });
  });
});

describe("middleware config", () => {
  it("has correct matcher pattern", () => {
    expect(config.matcher).toEqual([
      "/((?!_next/static|_next/image|robots.txt|sitemap.xml).*)",
    ]);
  });

  it("has one matcher pattern", () => {
    expect(config.matcher).toHaveLength(1);
  });

  it("matcher pattern is a string", () => {
    expect(typeof config.matcher[0]).toBe("string");
  });
});
