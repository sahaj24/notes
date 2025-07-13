# Authentication Fix and Testing Guide

## Quick Fix Steps

### 1. Update Supabase Database
Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Copy and paste the entire content from /database/fix-user-creation.sql
```

### 2. Update Supabase Auth Settings
Go to Supabase Dashboard > Authentication > URL Configuration:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (add all of these):**
```
http://localhost:3000
http://localhost:3000/notes
http://localhost:3000/auth/callback
```

### 3. Clear Browser Data
- Clear cookies and local storage for `localhost:3000`
- Or use an incognito/private window

## Testing the Fix

### Test 1: Email Signup/Login
1. Go to `http://localhost:3000/signup`
2. Sign up with a new email
3. Check if you're redirected to `/notes` successfully
4. Verify in Supabase dashboard that:
   - `user_profiles` table has your entry with 30 coins
   - `user_transactions` table has a welcome bonus entry

### Test 2: Google OAuth (if configured)
1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to `/auth/callback` then to `/notes`

### Test 3: Coin System
1. Once logged in to `/notes`, check:
   - Coin display shows 30 coins in header
   - User tier shows "Free"
   - Generate a note and confirm coin deduction

## Troubleshooting

### Still getting "Database error saving new user"?
1. Check Supabase logs: Dashboard > Logs > select recent time range
2. Look for any SQL errors in the `handle_new_user` function
3. Verify all tables exist: `user_profiles`, `user_transactions`, `user_usage_history`, `tier_configs`

### Redirect loop or wrong page?
1. Clear browser cache completely
2. Check Supabase Auth settings match exactly
3. Try incognito window

### Coins not showing?
1. Check browser console for API errors
2. Verify user profile was created in database
3. Check if `UserProfileProvider` is properly wrapping the app

## Manual Database Verification

After successful login, check these tables in Supabase:

```sql
-- Check if your user profile exists
SELECT * FROM user_profiles WHERE email = 'your-email@example.com';

-- Check if welcome bonus was recorded
SELECT * FROM user_transactions WHERE user_id = 'your-user-id';

-- Check signup was logged
SELECT * FROM user_usage_history WHERE user_id = 'your-user-id';
```

## Success Indicators

✅ No error in URL after login  
✅ Redirected to `/notes` page  
✅ Coin display shows 30 coins  
✅ User tier shows "Free"  
✅ Can generate notes and see coin deduction  
✅ Transaction history shows welcome bonus  

If all checks pass, the monetization system is working correctly!
