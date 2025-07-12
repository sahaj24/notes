# Notopy - AI-Powered Note Taking App

## Overview
Notopy is a beautiful AI-powered note-taking application that generates visually stunning, colorful notes with hand-drawn elements and natural handwriting styles. The app includes a comprehensive coin system for managing note generation usage.

## Features

### 🎨 Visual Design
- Hand-drawn aesthetics with SVG illustrations
- Colorful backgrounds and organic shapes
- Custom handwriting fonts and natural text styling
- Creative layouts and animations

### 🤖 AI Integration
- Google Gemini AI API for content generation
- Multiple note types (study guides, summaries, mind maps, etc.)
- Intelligent content structuring

### 🪙 Coin System
- **Guest Users**: 5 coins (no login required)
- **Registered Users**: 30 coins on signup
- **Cost**: 1 coin per note generation
- **Tracking**: Complete transaction history and coin management

### 🔐 Authentication
- Google OAuth login
- Email/password authentication
- User profiles and preferences
- Session management

### 💾 Data Storage
- Supabase backend with PostgreSQL
- Secure user data storage
- Note history and organization
- File storage for generated content

## Coin System Details

### For Users
- **Guest Users**: Get 5 coins automatically (stored in local session)
- **Registered Users**: Get 30 coins on signup
- **Note Generation**: Costs 1 coin per note
- **Coin Display**: Always visible in the UI

### Implementation
- **Frontend**: React context for state management
- **Backend**: Supabase functions for coin operations
- **Database**: Dedicated tables for coin tracking
- **Guest Sessions**: Temporary sessions for non-logged users

## Database Schema

### Recommended Schema: `supabase-schema.sql`
This is the **RECOMMENDED** schema that includes all features:

```sql
-- Main tables
- profiles (with coin system)
- notes (with cost tracking)
- coin_transactions (transaction history)
- guest_sessions (for non-logged users)

-- Features included
- Coin management functions
- Guest session tracking
- Transaction history
- Automatic cleanup
```

### Basic Schema: `schema.sql`
This is a basic schema without coins (not recommended for production):

```sql
-- Basic tables only
- profiles (basic)
- notes (basic)
```

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project
2. **Use the `supabase-schema.sql` file** (recommended)
3. Run the schema in your Supabase SQL editor
4. Enable Google OAuth in Supabase Auth settings
5. Set up your environment variables

### 2. Environment Variables
Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Development
```bash
npm install
npm run dev
```

## Database Schema Comparison

| Feature | supabase-schema.sql | schema.sql |
|---------|-------------------|------------|
| Basic profiles & notes | ✅ | ✅ |
| Coin system | ✅ | ❌ |
| Guest sessions | ✅ | ❌ |
| Transaction history | ✅ | ❌ |
| Automatic cleanup | ✅ | ❌ |

## File Structure

```
src/
├── app/
│   ├── api/generate-note/     # AI note generation endpoint
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   └── notes/                 # Main notes interface
├── components/
│   ├── AuthPage.tsx          # Authentication (Google + Email)
│   ├── BeautifulNote.tsx     # Main note interface
│   ├── NoteGenerator.tsx     # Note generation form
│   └── LandingPage.tsx       # Landing page
├── contexts/
│   ├── AuthContext.tsx       # Authentication state
│   └── NotesContext.tsx      # Notes state
├── lib/
│   ├── supabase.ts           # Supabase client & services
│   └── supabase-config.ts    # Supabase configuration
```

## Authentication Flow

1. **Guest Access**: Automatic 5-coin session
2. **Google Login**: OAuth flow with 30 coins
3. **Email Signup**: Manual registration with 30 coins
4. **Session Management**: Automatic cleanup and tracking

## Coin Management

### User Flow
1. **New User**: 30 coins on signup
2. **Note Generation**: -1 coin per note
3. **Guest Users**: 5 coins, no replenishment

### Technical Implementation
- **Frontend**: React hooks for coin state
- **Backend**: Supabase functions for operations
- **Database**: Dedicated coin tables and triggers
- **Security**: Row-level security policies

## API Endpoints

### `/api/generate-note`
- **Method**: POST
- **Body**: `{ topic: string, noteType: string }`
- **Response**: Generated note HTML/SVG
- **Cost**: 1 coin (deducted before generation)

## Next Steps

1. **Deploy to Production**: Set up hosting and production database
2. **Add Payment System**: Optional coin purchase system
3. **Enhanced Features**: More note types, templates, sharing
4. **Analytics**: Usage tracking and optimization
5. **Mobile App**: React Native version

## Support

For issues or questions:
1. Check the console for error messages
2. Verify Supabase connection and schema
3. Ensure environment variables are set
4. Check coin balance and authentication state

---

**Important**: Always use `supabase-schema.sql` for the full feature set including the coin system!
