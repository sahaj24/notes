'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a singleton instance to avoid multiple instances during hydration
let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit'
    }
  });
};

if (typeof window !== 'undefined') {
  supabaseInstance = supabaseInstance || createSupabaseClient();
} else {
  supabaseInstance = createSupabaseClient();
}

const supabase = supabaseInstance;

export { supabase };