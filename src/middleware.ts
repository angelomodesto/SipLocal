import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect routes that require authentication
 * 
 * IMPORTANT: Supabase stores sessions in localStorage by default, which middleware cannot access.
 * Therefore, this middleware is disabled and we rely entirely on client-side auth checks
 * in the page components themselves (board/page.tsx, profile/page.tsx).
 * 
 * If you need server-side route protection, you should use @supabase/ssr package
 * which properly handles cookie-based sessions for Next.js.
 */
export async function middleware(request: NextRequest) {
  // Allow all requests through - client-side components handle auth checks
  // This prevents middleware from incorrectly blocking authenticated users
  // whose sessions are stored in localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

