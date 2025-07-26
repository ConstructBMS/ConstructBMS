# 🚀 Supabase Setup Instructions

The errors you're seeing indicate that the application is trying to connect to `https://your-project.supabase.co`, which is a placeholder URL. You need to configure your actual Supabase credentials.

## 📋 Step 1: Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

## 📋 Step 2: Create .env.local File

Create a file named `.env.local` in your project root directory with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend Configuration
VITE_API_URL=http://localhost:3001/api

# JWT Secret for backend
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Development Configuration
NODE_ENV=development
```

## 📋 Step 3: Replace the Placeholder Values

Replace these values in your `.env.local` file:

- `https://your-project-id.supabase.co` → Your actual Supabase Project URL
- `your-anon-key-here` → Your actual Supabase Anon Key

## 📋 Step 4: Set Up Your Database

1. Go to your Supabase SQL Editor
2. Run the `supabase/schema.sql` file first to create all tables
3. Then run the `supabase/reset-demo-data.sql` file to insert demo data with your credentials

## 📋 Step 5: Restart the Development Server

After creating the `.env.local` file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## 🔍 Example of What Your .env.local Should Look Like

```env
# Example (replace with your actual values)
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NzUyNzIwMCwiZXhwIjoxOTYzMTAzMjAwfQ.example-key-here
VITE_API_URL=http://localhost:3001/api
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## ⚠️ Important Notes

1. **Never commit .env.local to git** - it contains sensitive credentials
2. The `.env.local` file should be in your project root (same level as `package.json`)
3. Make sure to restart your development server after creating the file
4. Your Supabase project should have the tables created from the schema.sql file

## 🎯 Expected Result

After completing these steps:
- The console errors should disappear
- You should be able to login with: `constructbms@gmail.com` / `ConstructBMS25`
- Analytics and performance tracking should work properly
- All Supabase features (auth, database, real-time) should function correctly

## 🆘 Need Help?

If you're still having issues after following these steps, please share:
1. Your actual Supabase Project URL (you can mask the project ID)
2. Whether you've created the database tables
3. Any remaining console errors 