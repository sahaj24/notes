# Supabase Configuration Fix

## 1. Run the Database Fix

First, run this SQL in your Supabase SQL editor:

```sql
-- Run the fix-user-creation.sql file content
```

## 2. Update Supabase Auth Settings

Go to Supabase Dashboard > Authentication > URL Configuration and update:

### Site URL:
```
http://localhost:3000
```

### Redirect URLs:
```
http://localhost:3000
http://localhost:3000/notes
http://localhost:3000/auth/callback
```

## 3. Update OAuth Provider Settings

If using Google OAuth, make sure the redirect URI in Google Console includes:
```
https://ymjlsailiajstonfldgm.supabase.co/auth/v1/callback
```

## 4. Test the Setup

1. Clear browser cache and cookies for localhost:3000
2. Try signing up with a new email
3. Check if you're redirected to /notes instead of getting errors

## 5. Verify Database

After signup, check in Supabase dashboard that:
- user_profiles table has your user entry
- user_transactions table has the welcome bonus
- user_usage_history table has the signup entry

## Common Issues

### If still getting database errors:
1. Check Supabase logs in Dashboard > Logs
2. Verify RLS policies are correct
3. Make sure the trigger function exists and has proper permissions

### If redirect issues persist:
1. Update the signInWithGoogle function to use the correct redirect
2. Make sure your OAuth app settings match the Supabase URLs
