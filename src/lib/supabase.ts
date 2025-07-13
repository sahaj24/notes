import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymjlsailiajstonfldgm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxzYWlsaWFqc3RvbmZsZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODI3NDEsImV4cCI6MjA2Nzk1ODc0MX0.EXaihyqm_BdSJYqBGfMcuWCYTbkJTwRrfvRVMflv0vo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);