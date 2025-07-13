# 💰 Notopy Monetization System

A comprehensive coin-based monetization system for the Notopy AI note generation platform.

## 🎯 Overview

The monetization system implements a coin-based economy where users pay for note generation with the following features:

- **Coin-based payments**: 1 coin = 1 page of notes
- **Three-tier system**: Free, Pro, Enterprise
- **Usage tracking**: Complete transaction and usage history
- **Monthly limits**: Free tier limited to 10 notes per month
- **Welcome bonus**: 30 coins on signup
- **Real-time balance**: Live coin display in UI

## 🗄️ Database Schema

### Core Tables

#### `user_profiles`
- Stores user coin balance, tier, and usage statistics
- Links to Supabase auth.users table
- Tracks monthly limits and total notes generated

#### `user_transactions`
- Complete audit trail of all coin movements
- Supports earned, spent, bonus, refund, penalty transactions
- Links to specific notes or actions via reference_id

#### `user_notes`
- Stores all generated notes with metadata
- Tracks coins spent, word count, export count
- Supports tagging and categorization

#### `user_usage_history`
- Detailed analytics of user actions
- Tracks note generation, exports, logins, etc.
- Stores IP addresses and user agents for analytics

#### `tier_configs`
- Configurable tier settings
- Monthly limits, features, pricing
- Bonus coins on signup/upgrade

## 🔧 API Endpoints

### User Profile Management

#### `GET /api/user/profile`
```typescript
// Returns user profile with stats
{
  id: string;
  email: string;
  coins: number;
  tier: 'free' | 'pro' | 'enterprise';
  monthly_notes_count: number;
  total_notes_generated: number;
  // ... additional stats
}
```

#### `PATCH /api/user/profile`
```typescript
// Update user profile (tier, name, etc.)
{
  tier?: 'pro' | 'enterprise';
  full_name?: string;
}
```

### Coin Management

#### `POST /api/user/coins`
```typescript
// Process coin transaction
{
  amount: number;           // Positive for earning, negative for spending
  transaction_type: string; // 'earned', 'spent', 'bonus', etc.
  description: string;
  reference_id?: string;    // Optional reference to note/action
}
```

#### `GET /api/user/coins`
```typescript
// Get transaction history
{
  limit?: number;   // Default 50
  offset?: number;  // Default 0
}
```

### Note Generation

#### `POST /api/generate-note`
- **Enhanced with coin system**
- Checks user authentication and coin balance
- Deducts coins automatically (1 coin per page)
- Records transaction and usage history
- Returns updated coin balance

```typescript
{
  topic: string;
  template: string;
  pages: number;
  // Response includes:
  coinsRemaining?: number;
  coinsSpent?: number;
  noteId?: string;
}
```

## 🎨 Frontend Components

### `CoinDisplay`
Real-time coin balance with transaction history dropdown

```tsx
<CoinDisplay 
  showDetails={boolean}  // Show additional stats
  className={string}     // Custom styling
/>
```

### `UserProfileContext`
React context for managing user profile and coin operations

```tsx
const { 
  profile,           // User profile with stats
  transactions,      // Recent transactions
  refreshProfile,    // Refresh user data
  deductCoins,       // Deduct coins
  addCoins,          // Add coins
  upgradeAccount     // Change tier
} = useUserProfile();
```

## 💳 Pricing Tiers

### Free Tier
- **Cost**: $0/month
- **Coins**: 30 on signup
- **Limit**: 10 notes per month
- **Features**: Basic note formats, image export

### Pro Tier
- **Cost**: $12/month
- **Coins**: 100 bonus on upgrade
- **Limit**: Unlimited notes
- **Features**: All formats, PDF export, priority support

### Enterprise Tier
- **Cost**: $49/month
- **Coins**: 200 bonus on upgrade
- **Limit**: Unlimited notes
- **Features**: Team collaboration, custom branding, 24/7 support

## 🔒 Security Features

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access their own data
- Secure database functions for coin transactions

### Transaction Safety
- Atomic coin transactions with row locking
- Prevents double-spending and race conditions
- Complete audit trail for all operations

### API Security
- JWT token validation
- Rate limiting considerations
- Input validation and sanitization

## 🚀 Setup Instructions

1. **Database Setup**
   ```bash
   # Run the schema in Supabase SQL editor
   cat database/schema.sql | pbcopy
   # Paste into Supabase SQL editor and execute
   ```

2. **Environment Configuration**
   ```bash
   # Update Supabase credentials in src/lib/supabase.ts
   # Or run the setup script
   ./setup-monetization.sh
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing the System

### New User Flow
1. Sign up for account → Receives 30 coins automatically
2. Generate a note → 1 coin deducted per page
3. Check coin balance → Updates in real-time
4. View transaction history → Shows welcome bonus and spending

### Coin Deduction Flow
1. Select number of pages (1-10)
2. System calculates cost (1 coin per page)
3. Check if user has sufficient funds
4. Generate note and deduct coins atomically
5. Update UI with new balance

### Monthly Limits (Free Tier)
1. Free users limited to 10 notes per month
2. Counter resets monthly automatically
3. Upgrade prompt when limit reached

## 📊 Analytics & Monitoring

### User Stats View
```sql
SELECT * FROM user_stats WHERE id = 'user-uuid';
```

### Transaction Monitoring
```sql
SELECT * FROM user_transactions 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Monthly Reset Function
```sql
SELECT reset_monthly_note_counts();
```

## 🔧 Database Functions

### `process_coin_transaction()`
Safely handles all coin transactions with proper locking

### `handle_new_user()`
Automatically creates user profile and welcome bonus on signup

### `reset_monthly_note_counts()`
Resets monthly counters (can be run as cron job)

## 📈 Future Enhancements

- **Coin Packages**: Purchase coin bundles
- **Referral System**: Earn coins for referrals
- **Achievement System**: Bonus coins for milestones
- **Subscription Management**: Stripe integration for Pro/Enterprise
- **Usage Analytics Dashboard**: Detailed reporting
- **Team Features**: Shared coin pools for Enterprise

## 🎉 Success Metrics

The monetization system tracks:
- **User Engagement**: Notes generated, export count
- **Revenue Metrics**: Tier distribution, upgrade rate
- **Usage Patterns**: Peak times, popular templates
- **Retention**: Monthly active users, churn rate

## 🆘 Troubleshooting

### Common Issues

1. **Coins not deducting**
   - Check API authentication
   - Verify RLS policies
   - Check transaction logs

2. **Monthly limits not working**
   - Run monthly reset function
   - Check tier configuration

3. **UI not updating**
   - Refresh user profile context
   - Check WebSocket connections
   - Verify API responses

### Debug Commands

```sql
-- Check user profile
SELECT * FROM user_profiles WHERE email = 'user@example.com';

-- Check recent transactions
SELECT * FROM user_transactions WHERE user_id = 'uuid' ORDER BY created_at DESC LIMIT 10;

-- Check tier configurations
SELECT * FROM tier_configs;
```

---

## 💡 Implementation Summary

✅ **Complete monetization system implemented**
✅ **Secure coin-based transactions**
✅ **Three-tier pricing model**
✅ **Real-time UI updates**
✅ **Comprehensive analytics**
✅ **Automated user onboarding**
✅ **Monthly limit enforcement**

The system is production-ready and provides a solid foundation for monetizing the AI note generation platform while maintaining excellent user experience.
