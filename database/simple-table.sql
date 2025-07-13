-- SIMPLE SINGLE TABLE SOLUTION
-- Only ONE table with everything we need
-- Run this in Supabase SQL Editor

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS user_transactions CASCADE;
DROP TABLE IF EXISTS user_notes CASCADE;
DROP TABLE IF EXISTS user_usage_history CASCADE;
DROP TABLE IF EXISTS tier_configs CASCADE;

-- Create ONE simple table with everything
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT DEFAULT '',
  coins INTEGER DEFAULT 30 CHECK (coins >= 0),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  total_notes_generated INTEGER DEFAULT 0,
  total_coins_spent INTEGER DEFAULT 0,
  last_transaction JSONB DEFAULT NULL, -- Store last transaction info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users manage own profile" ON user_profiles;

-- Create separate policies for better control
CREATE POLICY "Enable read access for users" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Also grant to anon in case needed
GRANT SELECT ON user_profiles TO anon;
