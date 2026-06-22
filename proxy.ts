import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// 1. Specify protected and public-only routes
const protectedRoutes = ['/dashboard'];
const authOnlyRoutes = ['/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(route + '/'));
  const isAuthOnlyRoute = authOnlyRoutes.some((route) => path === route || path.startsWith(route + '/'));

  // 2. Decrypt the session from the cookie
  // Note: For Next.js proxy, we can retrieve cookies directly from req.cookies
  const sessionCookie = req.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  // 3. Redirect to /login if the user is not authenticated on a protected route
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 4. Redirect to /dashboard if the user is authenticated on an auth-only route
  if (isAuthOnlyRoute && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
}

// Specify matchers to avoid running proxy on static files/images/api/etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
