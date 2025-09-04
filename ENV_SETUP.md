# Environment Setup Guide

## Overview

This document explains how to set up the environment variables for the ConstructBMS application.

## Environment Files

### Frontend (.env)

Located in the `frontend/` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://cowaiflapeowmvzthoto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvd2FpZmxhcGVvd212enRob3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# API Configuration
VITE_API_URL=http://localhost:5174

# Environment
VITE_NODE_ENV=development
```

### Backend (.env)

Located in the `backend/` directory:

```env
# Server Configuration
PORT=5174
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://cowaiflapeowmvzthoto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvd2FpZmxhcGVvd212enRob3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL=your-database-url

# Security
BCRYPT_ROUNDS=12
```

## Configuration Details

### Frontend Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_API_URL`: Backend API URL (default: http://localhost:5174)
- `VITE_NODE_ENV`: Environment mode (development/production)

### Backend Variables

- `PORT`: Server port (default: 5174)
- `NODE_ENV`: Environment mode
- `JWT_SECRET`: Secret key for JWT token signing
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations)
- `FRONTEND_URL`: Frontend URL for CORS configuration
- `DATABASE_URL`: Database connection string
- `BCRYPT_ROUNDS`: Number of rounds for password hashing

## Demo Mode vs Production Mode

### Demo Mode

- Activated when Supabase credentials are missing or invalid
- Uses simulated authentication
- No actual API calls to backend
- Good for development and testing

### Production Mode

- Activated when valid Supabase credentials are provided
- Uses real authentication with backend API
- Requires proper database setup
- Suitable for production deployment

## Test Credentials

For testing the application, you can use these credentials:

```
Email: test@constructbms.com
Password: Test123!
```

Or create a new user using the registration endpoint:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"YourPassword123!","name":"Your Name"}' \
  http://localhost:5174/api/auth/register
```

## Security Notes

1. **Never commit .env files** to version control
2. **Change default secrets** in production
3. **Use strong passwords** for JWT secrets
4. **Rotate keys regularly** in production environments
5. **Use environment-specific** configurations

## Troubleshooting

### Common Issues

1. **Demo mode not working**: Check if Supabase credentials are properly set
2. **API connection errors**: Verify backend is running on correct port
3. **CORS errors**: Ensure FRONTEND_URL matches your frontend URL
4. **Authentication failures**: Check database connection and user credentials

### Development Tips

1. Use different .env files for different environments
2. Keep sensitive data out of version control
3. Use strong, unique secrets for each environment
4. Test authentication flow regularly
