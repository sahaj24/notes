import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req) {
  const res = NextResponse.next();
  
  try {
    // Only process auth-related routes to reduce overhead
    const pathname = req.nextUrl.pathname;
    
    // Skip middleware for static files and API routes that don't need auth
    if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth')) {
      return res;
    }
    
    // Create a Supabase client for the middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => req.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove: (name, options) => {
            res.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Only refresh session for protected routes
    if (pathname.startsWith('/notes') || pathname.startsWith('/auth/callback')) {
      await supabase.auth.getSession();
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  // Add cache control headers to prevent unnecessary revalidation
  res.headers.set('Cache-Control', 'private, no-store, max-age=0');

  return res;
}

// Only run middleware on auth-related paths
export const config = {
  matcher: [
    '/auth/:path*',
    '/login',
    '/signup',
    '/notes/:path*',
  ],
};
