'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
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

    handleAuthCallback();
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
