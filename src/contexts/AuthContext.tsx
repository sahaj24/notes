'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, authService, UserProfile, coinService, GuestSession } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  guestSession: GuestSession | null;
  userCoins: number;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCoins: () => Promise<void>;
  spendCoins: (amount: number, description?: string, noteId?: string) => Promise<boolean>;
  refundCoins: (amount: number, description?: string) => Promise<boolean>;
  initializeGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCoins = async () => {
    if (user && profile) {
      // Logged in user
      try {
        const coins = await coinService.getUserCoins(user.id);
        setUserCoins(coins);
      } catch (error) {
        console.error('Error refreshing user coins:', error);
      }
    } else if (guestSession) {
      // Guest user
      setUserCoins(guestSession.coins);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        const userProfile = await authService.getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setUserCoins(userProfile.coins);
        } else {
          // Create profile if it doesn't exist
          const newProfile = await authService.createOrUpdateProfile({
            id: user.id,
            email: user.email!,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            coins: 30,
            total_coins_earned: 30,
            total_coins_spent: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setProfile(newProfile);
          setUserCoins(newProfile.coins);
        }
      } catch (error) {
        console.error('Error fetching/creating profile:', error);
      }
    }
  }, [user]);

  const initializeGuest = useCallback(async () => {
    if (!user) {
      const existingSessionToken = localStorage.getItem('guest_session_token');
      let session = null;
      
      if (existingSessionToken) {
        session = await coinService.getGuestSession(existingSessionToken);
      }
      
      if (!session) {
        session = await coinService.createGuestSession();
        localStorage.setItem('guest_session_token', session.session_token);
      }
      
      setGuestSession(session);
      setUserCoins(session.coins);
    }
  }, [user]);

  const spendCoins = async (amount: number, description?: string, noteId?: string): Promise<boolean> => {
    if (user && profile) {
      // Logged in user
      const success = await coinService.spendCoins(user.id, amount, description, noteId);
      if (success) {
        await refreshCoins();
      }
      return success;
    } else if (guestSession) {
      // Guest user
      const success = await coinService.spendGuestCoins(guestSession.session_token, amount);
      if (success) {
        const updatedSession = await coinService.getGuestSession(guestSession.session_token);
        if (updatedSession) {
          setGuestSession(updatedSession);
          setUserCoins(updatedSession.coins);
        }
      }
      return success;
    }
    return false;
  };

  const refundCoins = async (amount: number, description?: string): Promise<boolean> => {
    if (user && profile) {
      // Logged in user
      const success = await coinService.refundCoins(user.id, amount, description);
      if (success) {
        await refreshCoins();
      }
      return success;
    } else if (guestSession) {
      // Guest user
      const success = await coinService.refundGuestCoins(guestSession.session_token, amount);
      if (success) {
        const updatedSession = await coinService.getGuestSession(guestSession.session_token);
        if (updatedSession) {
          setGuestSession(updatedSession);
          setUserCoins(updatedSession.coins);
        }
      }
      return success;
    }
    return false;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Refresh profile when user signs in or token refreshes
          if (session?.user) {
            await refreshProfile();
            // Clear guest session when user signs in
            localStorage.removeItem('guest_session_token');
            setGuestSession(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUserCoins(0);
          // Initialize guest session after sign out
          await initializeGuest();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile]);

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      // Clear guest session when signing out
      localStorage.removeItem('guest_session_token');
      setGuestSession(null);
      setUserCoins(0);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Initialize guest session on component mount if no user
  useEffect(() => {
    if (!user && !loading) {
      initializeGuest();
    }
  }, [user, loading]);

  const value = {
    user,
    session,
    profile,
    guestSession,
    userCoins,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
    refreshCoins,
    spendCoins,
    refundCoins,
    initializeGuest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
