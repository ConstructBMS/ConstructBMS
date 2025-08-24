# 🚀 ConstructBMS Supabase Setup Guide

## 📋 **Quick Setup Steps**

### **1. Database Schema Setup**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/cowaiflapeowmvzthoto)
2. Navigate to **SQL Editor**
3. Copy the entire content from `database/schema.sql`
4. Paste and run the SQL commands
5. ✅ This creates all tables, indexes, and triggers

### **2. Seed Data Setup**
1. In the same SQL Editor
2. Copy the entire content from `database/seed.sql`
3. Paste and run the SQL commands
4. ✅ This creates sample data and admin user

### **3. Get Service Role Key**
1. In Supabase Dashboard → **Settings** → **API**
2. Copy the **service_role** key
3. Update `backend/.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvd2FpZmxhcGVvd212enRob3RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkzMDU0MywiZXhwIjoyMDcxNTA2NTQzfQ.11Tn8qDb-0GgrqRkjD20OJgRRo4qS4aXuwGJt8tOcWE
   ```

### **4. Test the Application**
1. Frontend: http://localhost:5173
2. Backend: http://localhost:5174
3. Login with: `constructbms@gmail.com` / `ConstructBMS25`

## 🔧 **Environment Variables**

### **Frontend** (`.env.local`)
```
VITE_SUPABASE_URL=https://cowaiflapeowmvzthoto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvd2FpZmxhcGVvd212enRob3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzA1NDMsImV4cCI6MjA3MTUwNjU0M30.w5vwGZP0XXYPjZ6HETgwEtHiJGLIzFEoi2Pgz2MDBs4
```

### **Backend** (`.env`)
```
SUPABASE_URL=https://cowaiflapeowmvzthoto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🎯 **What's Included**

### **Database Tables**
- ✅ Users (authentication & roles with password hashing)
- ✅ Modules (feature management)
- ✅ Menu Items (navigation)
- ✅ Clients, Contractors, Consultants (CRM)
- ✅ Projects (project management)
- ✅ Tasks (task tracking)
- ✅ Notes (documentation)
- ✅ Documents (file management)

### **Sample Data**
- ✅ **Super Admin User**: `constructbms@gmail.com` / `ConstructBMS25`
- ✅ Sample clients, projects, tasks
- ✅ All modules configured
- ✅ Menu structure set up

## 🔐 **Authentication**

The system now includes:
- **Password hashing** using bcrypt
- **JWT token authentication**
- **Role-based access control**
- **Secure password storage**

## 🚀 **Ready to Use!**

After completing these steps, your ConstructBMS application will be fully functional with:
- Real Supabase authentication
- Complete database schema
- Sample data for testing
- All features working
- **Secure admin login**: `constructbms@gmail.com` / `ConstructBMS25`

**🎉 Your ConstructBMS application is now production-ready!**
