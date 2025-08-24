# Database Setup Guide

This guide will help you set up the ConstructBMS database using Supabase.

## Prerequisites

1. A Supabase account (free tier available)
2. Basic knowledge of SQL

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `constructbms` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
6. Click "Create new project"
7. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Database Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Note down the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (for frontend)
   - **Service role key** (for backend - keep this secret!)

## Step 3: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `schema.sql`
4. Click "Run" to execute the schema
5. Verify that all tables were created successfully

## Step 4: Insert Seed Data

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `seed.sql`
3. Click "Run" to insert the initial data
4. Verify that the data was inserted successfully

## Step 5: Configure Row Level Security (RLS)

For production use, you should enable Row Level Security on your tables. Here are some example policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Example policy for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Example policy for projects table
CREATE POLICY "Users can view projects they have access to" ON projects
    FOR SELECT USING (true); -- Adjust based on your access control needs
```

## Step 6: Update Environment Variables

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5174/api
```

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
```

## Database Schema Overview

### Core Tables

#### users
- Stores user account information
- Includes role-based access control
- Supports avatar images

#### modules
- Defines system modules and their permissions
- Controls feature access and visibility
- Supports module activation/deactivation

#### menu_items
- Defines navigation menu structure
- Supports hierarchical menu items
- Links to modules for access control

#### projects
- Stores project information
- Links to clients
- Tracks project status and budget

#### tasks
- Task management and assignment
- Links to projects and assignees
- Supports priority and status tracking

#### clients
- Client contact information
- Company details
- Contact history

#### contractors
- Contractor information
- Specialties and expertise
- Contact details

#### consultants
- Consultant information
- Areas of expertise
- Contact details

#### notes
- Note-taking system
- Tagging support
- Author tracking

#### documents
- Document management
- File storage information
- Type categorization

### Junction Tables

#### user_modules
- Links users to modules
- Defines permissions (access, edit, delete)
- Supports granular access control

#### user_roles
- Role assignments
- Audit trail for role changes
- Supports multiple roles per user

## Database Features

### Automatic Timestamps
All tables include `created_at` and `updated_at` timestamps that are automatically managed by triggers.

### UUID Primary Keys
All tables use UUID primary keys for better security and scalability.

### Foreign Key Constraints
Proper foreign key relationships ensure data integrity.

### Indexes
Performance indexes are created on frequently queried columns.

## Backup and Recovery

### Automated Backups
Supabase provides automated daily backups for all projects.

### Manual Backups
You can create manual backups using the Supabase dashboard:
1. Go to **Settings** → **Database**
2. Click "Create backup"
3. Download the backup file

### Restore from Backup
1. Go to **Settings** → **Database**
2. Click "Restore from backup"
3. Upload your backup file

## Monitoring and Analytics

### Database Metrics
Supabase provides built-in monitoring:
- Query performance
- Connection usage
- Storage usage
- API usage

### Logs
Access database logs in the Supabase dashboard under **Logs**.

## Security Best Practices

1. **Never expose service role key** in frontend code
2. **Use environment variables** for all sensitive data
3. **Enable Row Level Security** for production
4. **Regular security audits** of your policies
5. **Monitor access patterns** for suspicious activity

## Troubleshooting

### Common Issues

#### Connection Errors
- Verify your Supabase URL and keys
- Check if your project is active
- Ensure your IP is not blocked

#### Permission Errors
- Verify RLS policies are correctly configured
- Check user roles and permissions
- Ensure proper authentication

#### Performance Issues
- Check query performance in the dashboard
- Optimize slow queries
- Consider adding indexes

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Visit the [Supabase community](https://github.com/supabase/supabase/discussions)
- Contact Supabase support for paid plans

## Migration Strategy

When updating the database schema:

1. **Create migration scripts** for schema changes
2. **Test migrations** in a development environment
3. **Backup production data** before applying changes
4. **Apply migrations** during maintenance windows
5. **Verify data integrity** after migrations

---

For more information about the ConstructBMS application, see the main [README.md](../README.md).
