'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash from the browser
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // If we have tokens in the URL, set them directly
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            router.replace('/login?error=session_error');
            return;
          }
          
          if (data.session) {
            console.log('Session set successfully');
            router.replace('/notes');
            return;
          }
        }
        
        // Fallback to getting the session normally
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to notes
          router.replace('/notes');
        } else {
          // No session, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/login?error=callback_failed');
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth callback timeout - redirecting to login');
      router.replace('/login?error=timeout');
    }, 10000); // 10 second timeout

    handleAuthCallback();

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
