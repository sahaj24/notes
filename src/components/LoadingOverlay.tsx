'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface LoadingOverlayProps {
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ children }) => {
  const { user, loading: authLoading, isReady } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // For logged-in users, wait until everything is loaded
    if (user && isReady && !authLoading) {
      // If user has profile or profile loading is done, show content
      if (profile || !profileLoading) {
        const timer = setTimeout(() => {
          setShowContent(true);
        }, 500); // Single 500ms delay to prevent any flashing
        return () => clearTimeout(timer);
      }
    } else if (!user && isReady && !authLoading) {
      // For non-logged-in users, show immediately
      setShowContent(true);
    }
  }, [user, isReady, authLoading, profile, profileLoading]);

  if (!showContent) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};