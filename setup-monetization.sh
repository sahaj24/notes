#!/bin/bash

# Notopy Monetization System Setup Script
# Run this script after setting up the database schema in Supabase

echo "🚀 Setting up Notopy Monetization System..."
echo "============================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install any missing dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Supabase configuration is updated
echo "🔍 Checking Supabase configuration..."
if grep -q "ymjlsailiajstonfldgm" src/lib/supabase.ts; then
    echo "✅ Supabase configuration updated"
else
    echo "⚠️  Warning: Supabase URL might not be updated in src/lib/supabase.ts"
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ymjlsailiajstonfldgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxzYWlsaWFqc3RvbmZsZGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODI3NDEsImV4cCI6MjA2Nzk1ODc0MX0.EXaihyqm_BdSJYqBGfMcuWCYTbkJTwRrfvRVMflv0vo

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyD2maptK3FUHCnFc6Y9cBRQuYRP1nB9WqQ
EOF
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. ✅ Database schema has been applied to Supabase"
echo "2. ✅ Frontend components are updated with coin system"
echo "3. ✅ API endpoints are configured for coin transactions"
echo "4. 🔄 Run 'npm run dev' to start the development server"
echo "5. 🧪 Test the system by:"
echo "   - Signing up a new user (should get 30 coins)"
echo "   - Generating notes (should deduct coins)"
echo "   - Checking transaction history"
echo ""
echo "📋 Monetization Features Implemented:"
echo "====================================="
echo "✅ User profiles with coin balance"
echo "✅ Three-tier system (Free, Pro, Enterprise)"
echo "✅ Coin-based note generation (1 coin = 1 page)"
echo "✅ Transaction history tracking"
echo "✅ Monthly limits for free users"
echo "✅ Welcome bonus (30 coins on signup)"
echo "✅ Coin display in UI"
echo "✅ Insufficient funds warnings"
echo "✅ Usage analytics"
echo ""
echo "🎉 Setup complete! Your monetization system is ready to test."
