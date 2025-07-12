export const supabaseConfig = {
  url: 'https://ztchcjepeltuggrmguye.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y2hjamVwZWx0dWdncm1ndXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjE2MTMsImV4cCI6MjA2NzgzNzYxM30.iTuJBwDwZFUhUFgoLqkc3DRrdvdVJSjTfXYhuVvj-G8',
  storage: {
    url: 'https://ztchcjepeltuggrmguye.supabase.co/storage/v1/s3',
    region: 'ap-southeast-1'
  }
};

// Use the anon key directly from config
export const SUPABASE_ANON_KEY = supabaseConfig.anonKey;
