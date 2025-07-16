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
  const [showTransactions, setShowTransactions] = useState(false);

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
      <div className="flex items-center space-x-3">
        {/* Coin Display */}
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-3 py-2 hover:border-gray-300 transition-colors duration-200 hover:shadow-sm"
          title="Click to view transaction history"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
            ¢
          </div>
          <span className="font-semibold text-gray-900">{profile.coins}</span>
        </button>
        
        {/* Upgrade Account Link - Show only when coins are zero */}
        {profile.coins === 0 && (
          <a 
            href="/pricing" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Upgrade Account
          </a>
        )}
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

      {/* Transaction History Dropdown */}
      {showTransactions && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Recent Transaction</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} coins
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          transaction.transaction_type === 'earned' ? 'bg-green-100 text-green-700' :
                          transaction.transaction_type === 'spent' ? 'bg-red-100 text-red-700' :
                          transaction.transaction_type === 'bonus' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.new_balance} coins
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => setShowTransactions(false)}
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showTransactions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTransactions(false)}
        ></div>
      )}
    </div>
  );
};
