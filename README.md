# MoodMoment - AI-Powered Mood Companion

A production-ready, responsive web application for mood tracking and wellness management designed for professionals.

## Features

### 🔐 Authentication & Security
- Secure email/password authentication
- JWT token-based sessions
- Password reset flow with secure tokens
- User data privacy and isolation
- Admin role management

### 📊 Mood Tracking
- Quick mood check-ins (stressed, tired, focused, happy)
- Optional note-taking for detailed context
- Historical mood data visualization
- Weekly mood distribution analytics

### 🤖 AI Wellness Suggestions
- Smart recommendations based on current mood
- Personalized micro-break suggestions
- Rule-based wellness tips (no external AI dependency)
- Context-aware activity recommendations

### 👤 User Management
- Profile management (name, password updates)
- Personal dashboard with mood insights
- Privacy-focused data handling
- Responsive settings interface

### 🛡️ Admin Panel
- User overview and management
- Individual user mood history access
- System-wide analytics
- Admin-only access controls

### 🎨 Design & UX
- Calming minimal aesthetic with Leaf Green (#4CAF50) accent
- Water droplet-inspired logo and iconography
- Fully responsive design (mobile, tablet, desktop)
- High contrast accessibility features
- Smooth animations and micro-interactions

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **date-fns** for date handling

### Backend
- **Supabase** for database and authentication
- **Supabase Edge Functions** for API endpoints
- **PostgreSQL** with Row Level Security (RLS)
- **JWT** for session management

### Architecture
- **Modular component structure** with clear separation of concerns
- **Custom hooks** for state management
- **Context providers** for global state
- **Protected routes** with role-based access
- **RESTful API** design

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Modern web browser

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd moodmoment
   npm install
   ```

2. **Database Setup:**
   - Create a new Supabase project
   - Click "Connect to Supabase" in the top right to set up the database
   - The migration files will automatically create the required schema

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open http://localhost:5173
   - Create an account to start tracking your mood

### Creating an Admin User

To test admin functionality, you can manually update a user in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Table Editor > users
3. Find your user and set `is_admin` to `true`
4. Refresh the app to see admin features

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── hooks/              # Custom React hooks
│   └── useMoods.ts    # Mood data management
├── lib/               # Utilities and configuration
│   └── supabase.ts   # Supabase client setup
├── pages/             # Page components
│   ├── Login.tsx     # Authentication pages
│   ├── SignUp.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Dashboard.tsx  # Main dashboard
│   ├── CheckIn.tsx   # Mood check-in interface
│   ├── Settings.tsx  # User settings
│   └── Admin.tsx     # Admin panel
└── App.tsx           # Main application component

supabase/
├── migrations/        # Database schema migrations
└── functions/        # Edge functions for API
    ├── auth-api/     # Authentication endpoints
    ├── user-api/     # User management endpoints
    ├── moods-api/    # Mood tracking endpoints
    └── admin-api/    # Admin functionality endpoints
```

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /register` - Create new user account
- `POST /login` - User sign in
- `POST /password/reset/request` - Request password reset
- `POST /password/reset/confirm` - Confirm password reset

### User Management (`/api/users/`)
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile

### Mood Tracking (`/api/moods/`)
- `GET /` - Get user's mood history
- `POST /` - Create new mood check-in
- `GET /suggest` - Get AI wellness suggestions

### Admin (`/api/admin/`)
- `GET /users` - List all users (admin only)
- `GET /user/{id}/moods` - Get user's mood history (admin only)

## Database Schema

### Users Table
- `id` (UUID, primary key)
- `email` (text, unique)
- `full_name` (text)
- `password_hash` (text)
- `is_admin` (boolean, default false)
- `created_at` (timestamp)

### Moods Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `mood` (enum: stressed, tired, focused, happy)
- `note` (text, optional)
- `created_at` (timestamp)

### Password Reset Tokens Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `token` (text, unique)
- `expires_at` (timestamp)
- `used` (boolean)
- `created_at` (timestamp)

## Security Features

### Data Privacy
- Row Level Security (RLS) enforced on all tables
- Users can only access their own data
- Admins have controlled access to user data
- Password hashing with salt (email-based)
- Secure token-based password reset

### Authentication
- JWT tokens with 24-hour expiration
- Secure token verification
- Protected routes with role checking
- Session management with localStorage

## AI Suggestions System

The app includes a rule-based AI suggestion system that provides personalized wellness recommendations:

### Mood-Based Suggestions

**Stressed/Anxious:**
- 1-minute box breathing exercises
- 30-second neck stretches
- 60-second eye rest (gaze away)

**Tired/Sleepy:**
- Stand and stretch for 60 seconds
- Hydration reminders
- 2-minute brisk walk suggestions

**Focused:**
- Micro-goal planning (2 minutes)
- Pomodoro technique breaks (45/5 cycles)
- Light hydration reminders

**Happy/Calm:**
- Flow state maintenance tips
- Gratitude note writing (2 minutes)
- Posture check reminders

## Deployment

The application is ready for deployment with:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform:**
   - Vercel, Netlify, or similar static hosting
   - Ensure environment variables are configured
   - Database is already hosted on Supabase

3. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code structure and TypeScript conventions
4. Ensure all components are responsive and accessible
5. Test thoroughly across different devices and browsers
6. Submit a pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the GitHub issues for common problems
- Review the database schema in Supabase dashboard
- Ensure all edge functions are properly deployed
- Verify environment variables are set correctly

---

Built with ❤️ for wellness and productivity. MoodMoment helps professionals maintain mental health awareness through simple, privacy-focused mood tracking.