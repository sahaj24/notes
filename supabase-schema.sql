-- Supabase Database Schema for Notopy with Coin System
-- This is the RECOMMENDED schema to use - it includes all features including coins

-- Create profiles table with coin system
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  coins INTEGER DEFAULT 0,
  total_coins_earned INTEGER DEFAULT 0,
  total_coins_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (id),
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  CONSTRAINT profiles_coins_check CHECK (coins >= 0)
);

-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  svg_content TEXT,
  cost INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}'::text[]
);

-- Create coin transactions table for tracking
CREATE TABLE coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'signup_bonus')),
  description TEXT,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create guest sessions table for tracking non-logged users
CREATE TABLE guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  coins INTEGER DEFAULT 5,
  notes_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + INTERVAL '7 days') NOT NULL
);

-- Create storage bucket for note files
INSERT INTO storage.buckets (id, name, public) VALUES ('note-files', 'note-files', true);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Notes policies
CREATE POLICY "Users can view their own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public notes" ON notes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Coin transactions policies
CREATE POLICY "Users can view their own transactions" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON coin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Guest sessions policies (public access needed for guest functionality)
CREATE POLICY "Anyone can view guest sessions" ON guest_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert guest sessions" ON guest_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update guest sessions" ON guest_sessions FOR UPDATE USING (true);

-- Storage policies
CREATE POLICY "Users can upload their own note files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own note files" ON storage.objects FOR SELECT USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own note files" ON storage.objects FOR UPDATE USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own note files" ON storage.objects FOR DELETE USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Public note files are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'note-files');

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to handle new user signup with coins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, coins, total_coins_earned)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    30, -- Registered users get 30 coins
    30  -- Track total earned
  );
  
  -- Create signup bonus transaction
  INSERT INTO public.coin_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 30, 'signup_bonus', 'Welcome bonus for new users');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to spend coins
CREATE OR REPLACE FUNCTION public.spend_coins(user_id UUID, amount INTEGER, description TEXT DEFAULT NULL, note_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile profiles;
BEGIN
  SELECT * INTO user_profile FROM profiles WHERE id = user_id;
  
  IF user_profile.coins >= amount THEN
    UPDATE profiles 
    SET 
      coins = coins - amount,
      total_coins_spent = total_coins_spent + amount
    WHERE id = user_id;
    
    INSERT INTO coin_transactions (user_id, amount, type, description, note_id)
    VALUES (user_id, -amount, 'spent', description, note_id);
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired guest sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_guest_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM guest_sessions WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_coins ON profiles(coins);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_is_public ON notes(is_public);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX idx_guest_sessions_token ON guest_sessions(session_token);
CREATE INDEX idx_guest_sessions_expires_at ON guest_sessions(expires_at);

-- Create a cron job to cleanup expired guest sessions (if pg_cron is enabled)
-- SELECT cron.schedule('cleanup-guest-sessions', '0 2 * * *', 'SELECT public.cleanup_expired_guest_sessions();');
