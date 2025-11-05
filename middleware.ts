import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(req: NextRequest) {
  // Run i18n handling first (adds locale prefixes, etc.)
  const res = intlMiddleware(req);

  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // Determine locale from path: "/{locale}/..."; fallback to default
  const pathSegments = pathname.split('/').filter(Boolean);
  const locale = locales.includes(pathSegments[0] as any)
    ? pathSegments[0]
    : defaultLocale;

  // If tokens exist, redirect away from landing and auth pages to chat
  // Note: This does not validate token; actual auth is enforced client-side by ProtectedRoute
  if (accessToken && refreshToken) {
    const isRoot = pathname === '/' || pathname === '';
    const isLocaleRoot = pathSegments.length === 1 && locales.includes(pathSegments[0] as any);
    const isAuthPage = pathSegments.length >= 2 && locales.includes(pathSegments[0] as any) && pathSegments[1] === 'auth';
    const isAlreadyInApp = pathSegments.includes('chat') || pathSegments.includes('admin');

    if ((isRoot || isLocaleRoot || isAuthPage) && !isAlreadyInApp) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/chat`;
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

