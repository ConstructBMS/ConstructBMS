@echo off
echo ========================================
echo   Supabase Database Migration Tool
echo ========================================
echo.

echo This script will help you migrate your Supabase database
echo from your personal account to the new ConstructBMS account.
echo.

echo Please ensure you have:
echo 1. PostgreSQL client tools installed (pg_dump, psql)
echo 2. Access to both Supabase projects
echo 3. Database passwords for both projects
echo.

pause

echo.
echo Step 1: Setting up environment variables...
echo.

set /p SOURCE_DB_PASSWORD="Enter your SOURCE database password: "
set /p TARGET_SUPABASE_URL="Enter your TARGET Supabase URL: "
set /p TARGET_DB_PASSWORD="Enter your TARGET database password: "

echo.
echo Environment variables set successfully!
echo.

echo Step 2: Running migration script...
echo.

node scripts/simple-migrate.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Migration completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Update your .env file with new credentials
    echo 2. Test your application thoroughly
    echo 3. Update production environment variables
    echo 4. Close the old Supabase project
    echo.
) else (
    echo.
    echo ========================================
    echo   Migration failed!
    echo ========================================
    echo.
    echo Please check the error messages above and try again.
    echo.
)

pause 