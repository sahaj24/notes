import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztchcjepeltuggrmguye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y2hjamVwZWx0dWdncm1ndXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjE2MTMsImV4cCI6MjA2NzgzNzYxM30.iTuJBwDwZFUhUFgoLqkc3DRrdvdVJSjTfXYhuVvj-G8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);