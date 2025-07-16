'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    // Prevent multiple redirects
    if (hasRedirected) return;
    
    const hasError = searchParams.get('error');
    
    if (hasError && user) {
      // User is authenticated despite the error, clean the URL
      setHasRedirected(true);
      router.replace('/notes');
    } else if (!loading && !user) {
      // Only redirect if we're not loading and definitely no user
      setHasRedirected(true);
      router.push('/login');
    }
  }, [user?.id, loading, hasRedirected]); // Use user.id instead of full user object

  // Show loading only if we're actually loading and haven't redirected
  if (loading && !hasRedirected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user and we haven't redirected yet
  if (!user && !hasRedirected) {
    return null;
  }

  // Only render children if we have a user
  if (user) {
    return <>{children}</>;
  }

  return null;
};
