import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req) {
  const res = NextResponse.next();
  
  try {
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

    // Refresh session if expired
    await supabase.auth.getSession();
  } catch (error) {
    console.error('Middleware error:', error);
  }

  // Add cache control headers to prevent unnecessary revalidation
  res.headers.set('Cache-Control', 'private, no-store');

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