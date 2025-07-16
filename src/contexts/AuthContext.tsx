'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Track if auth initialization has been completed
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Skip auth initialization during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    // Prevent multiple initializations
    if (isInitialized) return;
    
    let isMounted = true;
    
    // Fallback timeout to ensure loading doesn't persist indefinitely
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setIsInitialized(true);
        
        // Create user profile if it doesn't exist
        if (session?.user) {
          createUserProfileIfNeeded(session.user);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error in getSession:', error);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Create user profile on signup or signin
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          await createUserProfileIfNeeded(session.user);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const createUserProfileIfNeeded = async (user: User) => {
    try {
      console.log('Checking/creating profile for user:', user.email);
      
      // First, wait a bit for any triggers to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, coins, tier')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new user profile for:', user.email);
        
        const { data: insertedProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.user_metadata?.firstName + ' ' + user.user_metadata?.lastName ||
                      user.email?.split('@')[0] || 
                      '',
            coins: 30, // Welcome bonus
            tier: 'free'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          // Try the manual function as last resort
          const { error: manualError } = await supabase.rpc('create_user_profile_manual', {
            user_id: user.id
          });
          if (manualError) {
            console.error('Manual profile creation also failed:', manualError);
          }
        } else {
          console.log('User profile created successfully:', insertedProfile);
          
          // Record welcome bonus transaction
          const { error: transError } = await supabase
            .from('user_transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'bonus',
              amount: 30,
              previous_balance: 0,
              new_balance: 30,
              description: 'Welcome bonus for new user signup'
            });

          if (transError) {
            console.error('Error creating welcome transaction:', transError);
          }

          // Record signup in usage history
          const { error: usageError } = await supabase
            .from('user_usage_history')
            .insert({
              user_id: user.id,
              action_type: 'signup',
              metadata: {
                signup_method: user.app_metadata?.provider || 'email',
                email: user.email
              }
            });

          if (usageError) {
            console.error('Error creating usage history:', usageError);
          }
        }
      } else if (existingProfile) {
        console.log('User profile already exists:', existingProfile);
      } else {
        console.error('Error checking user profile:', checkError);
      }
    } catch (error) {
      console.error('Error in createUserProfileIfNeeded:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        console.error('Google sign in error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during Google sign in:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};