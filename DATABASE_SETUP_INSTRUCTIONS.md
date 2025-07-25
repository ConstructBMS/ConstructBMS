# Database Setup Instructions

##  Quick Fix for Database Issues

### Step 1: Access Your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your ConstructBMS project
3. Navigate to the SQL Editor

### Step 2: Run the Database Setup Script
1. Open the file 'complete-database-setup.sql' in your project
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click 'Run' to execute the script

### Step 3: Verify the Setup
After running the script, you should see:
- Tables created successfully
- Your user role inserted as super_admin
- No more database errors in the console

### Step 4: Test the Application
1. Refresh your ConstructBMS application
2. Check the browser console - no more database errors
3. Navigate to ProgrammeManager and test the Asta PowerProject scaffold

##  What the Script Does

- Creates all required permission tables
- Sets up proper indexes and triggers
- Enables Row Level Security (RLS)
- Creates security policies
- Inserts your user as a super_admin
- Grants necessary permissions

##  If You Still See Errors

If you continue to see database errors after running the script:

1. **Check your user ID**: Make sure the user ID in the script matches your actual Supabase user ID
2. **Clear browser cache**: Hard refresh (Ctrl+F5) your application
3. **Check Supabase logs**: Look for any errors in the Supabase dashboard

##  Need Help?

The application will work with fallback permissions even without the database setup, but for full functionality, run the database script.

Your user ID appears to be: 58309b6c-86f7-482b-af81-e3736be3e5f2
This is already included in the script.
