# Notopy Monetization System 💰

A comprehensive coin-based monetization system for the Notopy AI note generation platform.

## 🎯 Features Overview

### Core Monetization Features
- **Coin-based Payment System**: 1 coin = 1 page of notes
- **Welcome Bonus**: 30 coins for new signups
- **Tier-based Limits**: Free users limited to 10 notes/month
- **Real-time Balance Tracking**: Live coin balance display
- **Transaction History**: Complete audit trail of all coin movements
- **Usage Analytics**: Detailed tracking of user behavior

### User Tiers
| Tier | Price | Monthly Limit | Signup Bonus | Features |
|------|-------|---------------|--------------|----------|
| **Free** | $0 | 10 notes | 30 coins | Basic formats, Image export |
| **Pro** | $4.99 | 200 notes | 100 coins | All formats, PDF export, Priority support |
| **Enterprise** | $19 | Unlimited | 200 coins | Team collaboration, Custom branding, 24/7 support |

## 🗄️ Database Schema

### Core Tables
- `user_profiles` - User information, coins, tiers, usage stats
- `user_transactions` - All coin movements (earned, spent, bonus, refund)
- `user_notes` - Generated notes with metadata
- `user_usage_history` - Detailed user activity tracking
- `tier_configs` - Plan configurations and features

### Key Features
- Row Level Security (RLS) for data protection
- Automated triggers for profile creation and updates
- Safe transaction processing with PostgreSQL functions
- Comprehensive indexing for performance

## 🚀 Quick Setup

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Test the system:**
   - Sign up for a new account (should receive 30 coins)
   - Generate a note (should deduct coins)
   - Check transaction history

## 💳 API Endpoints

### User Profile Management
- `GET /api/user/profile` - Get user profile with stats
- `PATCH /api/user/profile` - Update user profile (tier, name)

### Coin Management
- `POST /api/user/coins` - Process coin transaction
- `GET /api/user/coins` - Get transaction history

### Note Generation
- `POST /api/generate-note` - Generate note with coin deduction

## 🎨 Frontend Components

### CoinDisplay Component
```tsx
<CoinDisplay showDetails={true} />
```
- Real-time coin balance
- Tier badge display
- Transaction history dropdown
- Click-to-view transaction details

### UserProfileContext
```tsx
const { profile, transactions, deductCoins, addCoins } = useUserProfile();
```
- Centralized user state management
- Automatic data refresh
- Coin transaction methods

## 💰 Revenue Model

### Primary Revenue Streams
1. **Tier Subscriptions**: Monthly/yearly Pro and Enterprise plans
2. **Coin Purchases**: Direct coin purchases for heavy users
3. **Enterprise Sales**: Custom enterprise solutions

### Cost Structure
- **Free Tier**: 30 coins + 10 notes/month limit
- **Pro Tier**: $4.99/month + 100 bonus coins + 200 notes/month
- **Enterprise**: $19/month + 200 bonus coins + unlimited notes

## 📊 Analytics & Tracking

### User Metrics
- Coin earn/spend patterns
- Note generation frequency
- Template preferences
- Export behavior
- Tier conversion rates

### Business Metrics
- Revenue per user
- Churn rates by tier
- Feature adoption
- Support ticket volume

## 🔧 Configuration

### Environment Variables
```env
SUPABASE_URL=https://ymjlsailiajstonfldgm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:Sahaj.1248@db.ymjlsailiajstonfldgm.supabase.co:5432/postgres
```

### Tier Configuration
Modify the `tier_configs` table to adjust:
- Monthly note limits
- Feature availability
- Pricing
- Bonus coin amounts

## 🛡️ Security Features

### Data Protection
- Row Level Security (RLS) on all tables
- User data isolation
- Secure transaction processing
- Input validation and sanitization

### Payment Security
- Atomic coin transactions
- Balance verification before operations
- Transaction logging for audit trails
- Rollback capabilities for failed operations

## 🎁 Reward System

### Current Rewards
- **Signup Bonus**: 30 coins for new users
- **Tier Upgrades**: Bonus coins on plan upgrades

### Planned Rewards (To Implement)
- **Daily Login**: Small coin bonus for consecutive days
- **Referral Program**: Coins for successful referrals
- **Quality Content**: Bonus for highly-rated notes
- **Milestones**: Achievements for usage milestones

## 📈 Growth Strategy

### User Acquisition
- Generous free tier (30 coins + 10 notes)
- Viral sharing of beautiful notes
- Educational institution partnerships
- Content marketing

### User Retention
- Progressive coin earning opportunities
- Tier upgrade incentives
- Feature unlocks at different usage levels
- Community features and sharing

### Revenue Optimization
- A/B testing on pricing
- Usage-based upgrade prompts
- Seasonal promotions
- Enterprise sales pipeline

## 🔍 Monitoring & Maintenance

### Key Metrics to Monitor
- Daily Active Users (DAU)
- Coin transaction volume
- Note generation rates
- Tier conversion rates
- System performance

### Regular Maintenance
- Database performance optimization
- Transaction log cleanup
- User engagement analysis
- Feature usage reports

## 🆘 Support & Troubleshooting

### Common Issues
1. **Coins not deducted**: Check transaction logs in `user_transactions`
2. **Profile not updating**: Verify RLS policies and triggers
3. **Tier limits not enforced**: Check `tier_configs` table

### Debug Commands
```sql
-- Check user profile
SELECT * FROM user_stats WHERE email = 'user@example.com';

-- View recent transactions
SELECT * FROM user_transactions WHERE user_id = 'user-uuid' ORDER BY created_at DESC LIMIT 10;

-- Check tier configurations
SELECT * FROM tier_configs;
```

## 🎯 Future Enhancements

### Short Term
- [ ] Coin purchase interface
- [ ] "Best user" reward implementation
- [ ] Email notifications for low balance
- [ ] Usage analytics dashboard

### Long Term
- [ ] Team collaboration features
- [ ] API access for enterprise
- [ ] White-label solutions
- [ ] Mobile app with coin sync

---

## 📝 Implementation Notes

This monetization system provides a solid foundation for generating revenue while maintaining a great user experience. The coin-based model is transparent and fair, while the tier system encourages upgrades for power users.

The system is designed to scale and can easily accommodate new features, pricing models, and business requirements as the platform grows.

For questions or support, please refer to the codebase documentation or contact the development team.
