import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATH_PREFIXES = ['/auth', '/_next', '/favicon.ico'];
const PUBLIC_PATHS = ['/', '/pricing', '/offline'];
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/study',
  '/flashcards',
  '/practice',
  '/formulas',
  '/team',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))) return NextResponse.next();

  if (!isProtectedPath(pathname)) return NextResponse.next();

  const accessToken = request.cookies.get('pmp_access_token')?.value;
  if (accessToken) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/auth/login';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|robots.txt|sitemap.xml).*)'],
};
