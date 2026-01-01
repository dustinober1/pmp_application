import crypto from 'crypto';
import type { Response } from 'express';
import type { TokenPair } from '@pmp/shared';
import { env } from '../config/env';

export const ACCESS_TOKEN_COOKIE = 'pmp_access_token';
export const REFRESH_TOKEN_COOKIE = 'pmp_refresh_token';
export const CSRF_TOKEN_COOKIE = 'pmp_csrf_token';

const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CSRF_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type SameSiteOption = 'lax' | 'strict' | 'none';

function getSameSite(): SameSiteOption {
  return env.NODE_ENV === 'production' ? 'lax' : 'lax';
}

function baseCookieOptions() {
  return {
    secure: env.NODE_ENV === 'production',
    sameSite: getSameSite(),
    path: '/',
  } as const;
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function setCsrfCookie(res: Response, csrfToken: string): void {
  res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: CSRF_TOKEN_MAX_AGE_MS,
  });
}

export function setAuthCookies(res: Response, tokens: TokenPair): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: tokens.expiresIn * 1000,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions());
  res.clearCookie(CSRF_TOKEN_COOKIE, baseCookieOptions());
}
