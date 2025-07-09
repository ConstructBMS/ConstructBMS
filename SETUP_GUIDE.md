# Archer Business Management System - Setup Guide

## Current Issues & Solutions

The application is currently showing some errors because Supabase is not configured. Here's how to fix them:

### 1. Supabase Configuration (Required for Full Features)

#### Option A: Set up Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Get your project URL and anon key from Settings > API
4. Create a `.env.local` file in the project root:

```bash
# Copy the development environment template
cp env.development.example .env.local
```

5. Edit `.env.local` and replace the placeholder values:
```bash
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
VITE_ANALYTICS_ENABLED=true
```

6. Run the database schema in your Supabase SQL editor:
```sql
-- Copy and paste the contents of supabase/schema.sql
```

#### Option B: Use Demo Mode (Quick Start)
If you want to test the application without Supabase:

1. Create a `.env.local` file:
```bash
# Development Environment Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ANALYTICS_ENABLED=false
VITE_REALTIME_ENABLED=false
VITE_APP_ENV=development
```

2. The application will show a warning about Supabase not being configured but will still run in demo mode.

### 2. PWA Icons (Optional)

The PWA manifest is currently using the Vite logo. To add custom icons:

1. Add your logo image to `public/` (e.g., `public/logo.png`)
2. Update `public/manifest.json`:
```json
{
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "any",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 3. Start the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Start backend server (in another terminal)
npm run server
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Demo Accounts** (if using backend server):
  - Super Admin: `superadmin@archer.com` / `password`
  - Admin: `admin@archer.com` / `password`
  - Employee: `employee@archer.com` / `password`

## Environment Variables Explained

### Required for Supabase Features
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Optional Features
- `VITE_ANALYTICS_ENABLED`: Enable/disable analytics tracking
- `VITE_REALTIME_ENABLED`: Enable/disable real-time features
- `VITE_PWA_ENABLED`: Enable/disable PWA features

### Development Features
- `VITE_DEBUG_MODE`: Enable debug logging
- `VITE_MOCK_DATA_ENABLED`: Use mock data instead of real API calls

## Troubleshooting

### "Supabase not configured" Warning
This is normal if you haven't set up Supabase. The app will still work in demo mode.

### Analytics Errors
These will stop once you either:
- Set up Supabase and enable analytics
- Disable analytics with `VITE_ANALYTICS_ENABLED=false`

### PWA Icon Errors
These are cosmetic and won't affect functionality. Add custom icons as described above.

### Login Issues
- If using Supabase: Make sure your credentials are correct
- If using demo mode: Use the demo accounts listed above

## Next Steps

1. **For Development**: Set up Supabase for full feature testing
2. **For Production**: Follow the `PRODUCTION_DEPLOYMENT.md` guide
3. **For Customization**: Modify components in `src/components/`
4. **For API Integration**: Update services in `src/services/`

## Support

- **Documentation**: Check the main README.md
- **Issues**: Create an issue in the repository
- **Questions**: Review the code comments and documentation

---

**Note**: The application is fully functional even without Supabase, but you'll miss out on real-time features, analytics, and persistent data storage. 