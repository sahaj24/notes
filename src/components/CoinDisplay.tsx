'use client';

import React, { useState } from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuth } from '@/contexts/AuthContext';

interface CoinDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { profile, transactions } = useUserProfile();
  const { user } = useAuth();
  // No transaction dropdown needed

  // Simple check - if no user or profile, don't show anything
  if (!user || !profile) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'text-blue-600 bg-blue-100';
      case 'enterprise':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return '⭐';
      case 'enterprise':
        return '👑';
      default:
        return '🆓';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        {/* Coin Display */}
        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-3 py-2 hover:border-gray-300 transition-colors duration-200 hover:shadow-sm">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
            ¢
          </div>
          <span className="font-semibold text-gray-900">{profile.coins}</span>
        </div>
      </div>

      {/* Detailed Info */}
      {showDetails && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Notes this month:</span>
            <span>
              {profile.monthly_notes_count}
              {profile.monthly_note_limit && (
                <span className="text-gray-400">
                  /{profile.monthly_note_limit}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total notes:</span>
            <span>{profile.total_notes_generated}</span>
          </div>
        </div>
      )}

      {/* No transaction dropdown */}
    </div>
  );
};
