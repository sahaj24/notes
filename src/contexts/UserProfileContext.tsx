'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  coins: number;
  tier: 'free' | 'pro' | 'enterprise';
  monthly_notes_count: number;
  total_notes_generated: number;
  monthly_note_limit: number | null;
  features: string[];
  notes_count: number;
  favorite_notes_count: number;
  total_coins_earned: number;
  total_coins_spent: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  transaction_type: 'earned' | 'spent' | 'bonus' | 'refund' | 'penalty';
  amount: number;
  previous_balance: number;
  new_balance: number;
  description: string;
  created_at: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  transactions: Transaction[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  deductCoins: (amount: number, description: string) => Promise<{ success: boolean; error?: string }>;
  addCoins: (amount: number, description: string) => Promise<{ success: boolean; error?: string }>;
  upgradeAccount: (tier: 'pro' | 'enterprise') => Promise<{ success: boolean; error?: string }>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshProfile = async () => {
    if (!user || !session) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
      } else {
        console.error('Failed to fetch profile:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (!user || !session) {
      setTransactions([]);
      return;
    }

    try {
      const response = await fetch('/api/user/coins?limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data);
      } else {
        console.error('Failed to fetch transactions:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const deductCoins = async (amount: number, description: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !session) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch('/api/user/coins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: -Math.abs(amount), // Ensure negative
          transaction_type: 'spent',
          description,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await refreshProfile();
        await refreshTransactions();
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to deduct coins' };
      }
    } catch (error) {
      console.error('Error deducting coins:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const addCoins = async (amount: number, description: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !session) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch('/api/user/coins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.abs(amount), // Ensure positive
          transaction_type: 'earned',
          description,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await refreshProfile();
        await refreshTransactions();
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to add coins' };
      }
    } catch (error) {
      console.error('Error adding coins:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const upgradeAccount = async (tier: 'pro' | 'enterprise'): Promise<{ success: boolean; error?: string }> => {
    if (!user || !session) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await refreshProfile();
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to upgrade account' };
      }
    } catch (error) {
      console.error('Error upgrading account:', error);
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    if (user && session) {
      refreshProfile();
      refreshTransactions();
    } else {
      setProfile(null);
      setTransactions([]);
    }
  }, [user, session]);

  const value: UserProfileContextType = {
    profile,
    transactions,
    loading,
    refreshProfile,
    refreshTransactions,
    deductCoins,
    addCoins,
    upgradeAccount,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};
