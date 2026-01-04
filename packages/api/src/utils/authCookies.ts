import crypto from "crypto";
import type { TokenPair } from "@pmp/shared";
import { env } from "../config/env";

export const ACCESS_TOKEN_COOKIE = "pmp_access_token";
export const REFRESH_TOKEN_COOKIE = "pmp_refresh_token";
export const CSRF_TOKEN_COOKIE = "pmp_csrf_token";

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CSRF_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type SameSiteOption = "lax" | "strict" | "none";

function getSameSite(): SameSiteOption {
  return env.NODE_ENV === "production" ? "lax" : "lax";
}

function baseCookieOptions() {
  return {
    secure: env.NODE_ENV === "production",
    sameSite: getSameSite(),
    path: "/",
  };
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function setCookie(
  res: any,
  name: string,
  value: string,
  options: {
    secure?: boolean;
    sameSite?: string;
    path?: string;
    httpOnly?: boolean;
    maxAge?: number;
  },
): void {
  if (typeof res.setCookie === "function") {
    res.setCookie(name, value, options);
  } else {
    res.cookie(name, value, options);
  }
}

function clearCookie(res: any, name: string, options: any): void {
  if (typeof res.clearCookie === "function") {
    res.clearCookie(name, options);
  } else {
    res.clearCookie(name, options);
  }
}

export function setCsrfCookie(res: any, csrfToken: string): void {
  setCookie(res, CSRF_TOKEN_COOKIE, csrfToken, {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: CSRF_TOKEN_MAX_AGE_MS,
  });
}

export function setAuthCookies(res: any, tokens: TokenPair): void {
  setCookie(res, ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: tokens.expiresIn * 1000,
  });

  setCookie(res, REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: any): void {
  clearCookie(res, ACCESS_TOKEN_COOKIE, baseCookieOptions());
  clearCookie(res, REFRESH_TOKEN_COOKIE, baseCookieOptions());
  clearCookie(res, CSRF_TOKEN_COOKIE, baseCookieOptions());
}
