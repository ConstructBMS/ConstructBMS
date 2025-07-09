# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `archer-project`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Environment Variables

1. Create a `.env` file in your project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:3001/api
```

## Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create all tables, policies, and demo data

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: `http://localhost:5173/**`
   - **Enable Email Confirmations**: Disabled (for development)
   - **Enable Email Change Confirmations**: Disabled

## Step 6: Set Up Storage Buckets

1. Go to **Storage** → **Buckets**
2. Create the following buckets:
   - `documents` (public)
   - `avatars` (public)
   - `project-files` (public)

3. For each bucket, set up policies:
   - Go to **Storage** → **Policies**
   - Add policies for authenticated users

## Step 7: Enable Row Level Security

The schema.sql file includes RLS policies, but verify they're active:

1. Go to **Authentication** → **Policies**
2. Ensure all tables have RLS enabled
3. Verify policies are created correctly

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with demo credentials:
   - **Super Admin**: `superadmin@archer.com` / `password`
   - **Admin**: `admin@archer.com` / `password`
   - **Employee**: `employee@archer.com` / `password`

## Step 9: Verify Real-time Features

1. Open browser console
2. Check for successful WebSocket connections
3. Test real-time features (notifications, chat)

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Add `http://localhost:5173` to allowed origins in Supabase settings

2. **Authentication Errors**:
   - Verify environment variables are correct
   - Check that user exists in database
   - Ensure RLS policies allow access

3. **Real-time Not Working**:
   - Check WebSocket connection in browser console
   - Verify database triggers are working
   - Check subscription setup

4. **File Upload Issues**:
   - Verify storage bucket exists
   - Check bucket policies
   - Ensure file size limits are appropriate

### Database Connection Issues

If you can't connect to the database:

1. Check your project URL and API key
2. Verify the project is active (not paused)
3. Check if you've hit any usage limits
4. Ensure your IP is not blocked

### Performance Optimization

1. **Enable Database Logs**:
   - Go to **Settings** → **Logs**
   - Enable query logging for debugging

2. **Set Up Monitoring**:
   - Use Supabase dashboard to monitor usage
   - Set up alerts for high usage

## Next Steps

After setup is complete:

1. **Migrate existing data** (if any)
2. **Test all features** thoroughly
3. **Set up production environment**
4. **Configure backups**
5. **Set up monitoring and alerts**

## Production Deployment

When ready for production:

1. Create a new Supabase project for production
2. Update environment variables
3. Run schema migration
4. Set up proper authentication settings
5. Configure custom domain (optional)
6. Set up monitoring and alerts

## Security Checklist

- [ ] RLS policies are active
- [ ] Authentication is properly configured
- [ ] API keys are secure
- [ ] Storage policies are restrictive
- [ ] Environment variables are not committed to git
- [ ] Database backups are enabled
- [ ] Monitoring is set up

## Support

If you encounter issues:

1. Check Supabase documentation
2. Review error logs in dashboard
3. Check browser console for errors
4. Verify all setup steps were completed
5. Contact Supabase support if needed 