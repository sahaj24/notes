#!/bin/bash

# Setup script for Notopy monetization system
# This script will create the database tables and configure the system

echo "🚀 Setting up Notopy Monetization System..."
echo "================================================"

# Database connection URL
DB_URL="postgresql://postgres:Sahaj.1248@db.ymjlsailiajstonfldgm.supabase.co:5432/postgres"

echo "📊 Creating database schema..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed. Please install PostgreSQL client."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Run the schema
if psql "$DB_URL" -f database/schema.sql; then
    echo "✅ Database schema created successfully!"
else
    echo "❌ Error creating database schema. Please check the connection and try again."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Summary of what was created:"
echo "  • user_profiles table (coins, tiers, usage tracking)"
echo "  • user_transactions table (coin movement history)" 
echo "  • user_notes table (generated notes storage)"
echo "  • user_usage_history table (detailed analytics)"
echo "  • tier_configs table (plan configurations)"
echo "  • Row Level Security policies"
echo "  • Database functions and triggers"
echo ""
echo "💰 Monetization Features:"
echo "  • 30 coins welcome bonus on signup"
echo "  • 1 coin = 1 page pricing model"
echo "  • Tier-based limits (Free: 10 notes/month)"
echo "  • Real-time coin tracking"
echo "  • Transaction history"
echo "  • Usage analytics"
echo ""
echo "🔧 Next Steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. Test user signup (should get 30 coins)"
echo "  3. Generate a note (should deduct coins)"
echo "  4. Check transaction history"
echo ""
echo "💡 Admin Tasks (Optional):"
echo "  • Add coin purchase functionality"
echo "  • Implement 'best user' rewards"
echo "  • Set up payment processing for tier upgrades"
echo "  • Configure email notifications"
echo ""
echo "✨ The monetization system is ready to use!"
