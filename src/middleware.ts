import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const pathname = request.nextUrl.pathname;

  // Auth pages - redirect to dashboard if already logged in
  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Only protect /dashboard routes - require authentication
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // All other routes (/, /docs, /help, /blog, /about, /privacy, /terms) are public
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.ico$).*)'],
};

