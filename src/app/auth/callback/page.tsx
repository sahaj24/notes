'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple processing attempts
    if (hasProcessed) return;
    
    let isMounted = true;
    
    const handleAuthCallback = async () => {
      if (!isMounted) return;
      
      setHasProcessed(true);
      
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
          
          if (!isMounted) return;
          
          if (error) {
            console.error('Error setting session:', error);
            router.replace('/login?error=session_error');
            return;
          }
          
          if (data.session) {
            console.log('Session set successfully');
            // Add a small delay to ensure auth context updates
            setTimeout(() => {
              if (isMounted) {
                router.replace('/notes');
              }
            }, 500);
            return;
          }
        }
        
        // Fallback to getting the session normally
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to notes
          setTimeout(() => {
            if (isMounted) {
              router.replace('/notes');
            }
          }, 500);
        } else {
          // No session, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth callback error:', error);
        router.replace('/login?error=callback_failed');
      }
    };

    // Shorter timeout to prevent long loading states
    const timeoutId = setTimeout(() => {
      if (isMounted && !hasProcessed) {
        console.warn('Auth callback timeout - redirecting to login');
        router.replace('/login?error=timeout');
      }
    }, 5000); // Reduced to 5 seconds

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      handleAuthCallback();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(initTimeout);
    };
  }, []); // Remove router dependency to prevent re-runs

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
