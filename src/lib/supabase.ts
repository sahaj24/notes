import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './supabase-config';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  coins: number;
  total_coins_earned: number;
  total_coins_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  svg_content?: string;
  cost: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  coins: number;
  daily_coins_last_claimed?: string;
  total_coins_earned: number;
  total_coins_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'spent' | 'signup_bonus';
  description?: string;
  note_id?: string;
  created_at: string;
}

export interface GuestSession {
  id: string;
  session_token: string;
  coins: number;
  notes_generated: number;
  created_at: string;
  last_used: string;
  expires_at: string;
}

// Note management functions
export const noteService = {
  async getUserNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async saveNoteToStorage(noteId: string, svgContent: string): Promise<string> {
    const fileName = `notes/${noteId}.svg`;
    const { data, error } = await supabase.storage
      .from('note-files')
      .upload(fileName, svgContent, {
        contentType: 'image/svg+xml',
        upsert: true
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('note-files')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },

  async getNoteFromStorage(noteId: string): Promise<string | null> {
    const fileName = `notes/${noteId}.svg`;
    const { data, error } = await supabase.storage
      .from('note-files')
      .download(fileName);
    
    if (error) return null;
    
    return await data.text();
  }
};

// Authentication functions
export const authService = {
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/notes`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return null;
    return data;
  },

  async createOrUpdateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Coin management functions
export const coinService = {
  async getUserCoins(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.coins || 0;
  },

  async spendCoins(userId: string, amount: number, description?: string, noteId?: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('spend_coins', { 
        user_id: userId, 
        amount, 
        description, 
        note_id: noteId 
      });
    
    if (error) throw error;
    return data || false;
  },

  async getCoinTransactions(userId: string): Promise<CoinTransaction[]> {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Guest session management
  async createGuestSession(): Promise<GuestSession> {
    const sessionToken = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('guest_sessions')
      .insert([{
        session_token: sessionToken,
        coins: 5,
        notes_generated: 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getGuestSession(sessionToken: string): Promise<GuestSession | null> {
    const { data, error } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (error) return null;
    return data;
  },

  async updateGuestSession(sessionToken: string, updates: Partial<GuestSession>): Promise<GuestSession> {
    const { data, error } = await supabase
      .from('guest_sessions')
      .update({ ...updates, last_used: new Date().toISOString() })
      .eq('session_token', sessionToken)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async spendGuestCoins(sessionToken: string, amount: number): Promise<boolean> {
    const session = await this.getGuestSession(sessionToken);
    if (!session || session.coins < amount) return false;
    
    await this.updateGuestSession(sessionToken, {
      coins: session.coins - amount,
      notes_generated: session.notes_generated + 1
    });
    
    return true;
  },

  async refundCoins(userId: string, amount: number, description?: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('coins, total_coins_spent')
      .eq('id', userId)
      .single();
    
    if (error || !data) return false;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        coins: data.coins + amount,
        total_coins_spent: Math.max(0, data.total_coins_spent - amount)
      })
      .eq('id', userId);
    
    if (updateError) return false;
    
    // Add refund transaction
    const { error: transactionError } = await supabase
      .from('coin_transactions')
      .insert([{
        user_id: userId,
        amount: amount,
        type: 'earned',
        description: description || 'Refund for failed operation'
      }]);
    
    return !transactionError;
  },

  async refundGuestCoins(sessionToken: string, amount: number): Promise<boolean> {
    const session = await this.getGuestSession(sessionToken);
    if (!session) return false;
    
    await this.updateGuestSession(sessionToken, {
      coins: session.coins + amount,
      notes_generated: Math.max(0, session.notes_generated - 1)
    });
    
    return true;
  }
};