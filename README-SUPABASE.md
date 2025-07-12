# Notopy - AI-Powered Note Generation with Supabase Integration

A beautiful AI-powered note-taking application that generates visually stunning, colorful notes with hand-drawn elements, shapes, and natural handwriting styles. The app uses Google's Gemini AI API to generate content and converts it into visually appealing notes, with full Supabase integration for authentication and data storage.

## Features

- 🎨 **Beautiful AI-Generated Notes**: Create stunning, colorful notes with hand-drawn aesthetics
- 🔐 **Google OAuth Authentication**: Secure sign-in with Google accounts
- 💾 **Cloud Storage**: Save and access your notes from anywhere with Supabase
- 📁 **Note Management**: Organize, edit, and delete your notes
- 🖼️ **SVG Export**: Export notes as SVG files with cloud storage backup
- 📱 **Responsive Design**: Works beautifully on all devices
- ⚡ **Real-time Sync**: All changes are synced to the cloud instantly

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, storage)
- **AI Integration**: Google Gemini AI API
- **Authentication**: Google OAuth via Supabase Auth
- **Storage**: Supabase Storage for note files
- **UI Components**: Lucide React icons, React Icons
- **Styling**: Tailwind CSS with custom handwriting effects

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console project with OAuth credentials
- Google Gemini AI API key

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd notes
npm install
```

### 2. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up the Database**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create all tables, policies, and functions

3. **Configure Authentication**
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable Google OAuth provider
   - Add your Google OAuth credentials (see step 3 below)

4. **Set up Storage**
   - Go to Storage in your Supabase dashboard
   - The `note-files` bucket should be created automatically from the schema
   - If not, create it manually and make it public

### 3. Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

4. **Configure Supabase**
   - In Supabase dashboard, go to Authentication > Settings
   - Enable Google provider
   - Add your Google OAuth Client ID and Client Secret

### 4. Google Gemini AI Setup

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

### 5. Environment Configuration

Your Supabase configuration is already set in `src/lib/supabase-config.ts`:

```typescript
export const supabaseConfig = {
  url: 'https://ztchcjepeltuggrmguye.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0Y2hjamVwZWx0dWdncm1ndXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjE2MTMsImV4cCI6MjA2NzgzNzYxM30.iTuJBwDwZFUhUFgoLqkc3DRrdvdVJSjTfXYhuVvj-G8'
};
```

The Google Gemini API key is configured in `src/app/api/generate-note/route.ts`:

```typescript
const API_KEY = 'AIzaSyD2maptK3FUHCnFc6Y9cBRQuYRP1nB9WqQ';
```

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Application Structure

```
src/
├── app/
│   ├── api/generate-note/     # Gemini AI API route
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── notes/                 # Protected notes page
│   └── layout.tsx             # Root layout with providers
├── components/
│   ├── AuthPage.tsx           # Authentication component
│   ├── BeautifulNote.tsx      # Main note generation component
│   ├── LandingPage.tsx        # Landing page
│   ├── NoteGenerator.tsx      # Note generation logic
│   └── ProtectedRoute.tsx     # Route protection
├── contexts/
│   ├── AuthContext.tsx        # Authentication context
│   └── NotesContext.tsx       # Notes management context
└── lib/
    ├── supabase.ts            # Supabase client and services
    └── supabase-config.ts     # Supabase configuration
```

## Key Features Implementation

### Authentication Flow
1. User clicks "Continue with Google"
2. Redirected to Google OAuth
3. On success, user profile is created/updated in Supabase
4. JWT token is managed by Supabase Auth
5. Protected routes check authentication status

### Note Generation & Storage
1. User enters topic and selects template
2. Request sent to Gemini AI API
3. Generated note is displayed in the UI
4. Note is automatically saved to Supabase database
5. SVG content is stored in Supabase Storage
6. Real-time sync with cloud storage

### Data Models

**User Profile**
```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

**Note**
```typescript
interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  svg_content?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  tags?: string[];
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management

The application uses Supabase for database management with automatic migrations and real-time subscriptions. Row Level Security (RLS) is enabled to ensure users can only access their own data.

### Storage Management

Notes are stored both in the database (metadata) and in Supabase Storage (SVG files). This allows for efficient querying and full-resolution note storage.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Supabase Production Setup

1. Ensure your production domain is added to Supabase Auth settings
2. Update redirect URLs in Google OAuth settings
3. Test authentication flow in production

## Security Considerations

- All API keys are properly secured
- Row Level Security (RLS) is enabled on all tables
- Google OAuth provides secure authentication
- Supabase handles JWT token management
- All user data is isolated by user ID

## Support

For issues and questions:
1. Check the GitHub issues
2. Review Supabase documentation
3. Check Google Cloud Console for OAuth issues
4. Verify Gemini AI API quotas and usage

## License

This project is licensed under the MIT License.
