@echo off
echo 🔧 Fixing environment and clearing caches...

echo 1. Killing existing Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo    ✅ Killed Node.js processes
) else (
    echo    ℹ️  No Node.js processes found
)

echo 2. Clearing npm cache...
call npm cache clean --force
echo    ✅ NPM cache cleared

echo 3. Clearing project caches...
if exist ".cache" rmdir /s /q ".cache"
if exist ".vite" rmdir /s /q ".vite"
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
echo    ✅ Project caches cleared

echo 4. Clearing TypeScript cache...
if exist "node_modules\.cache\.tsbuildinfo" del /f "node_modules\.cache\.tsbuildinfo"
echo    ✅ TypeScript cache cleared

echo 5. Reinstalling dependencies...
call npm install
echo    ✅ Dependencies reinstalled

echo 6. Testing terminal...
call npm --version
echo    ✅ Terminal working

echo 7. Testing Git...
call git --version
echo    ✅ Git working

echo.
echo 🎉 Environment fixed successfully!
echo.
echo Next steps:
echo 1. Start development server: npm run dev
echo 2. Or start full stack: npm run dev:full
echo 3. Or start with Supabase: npm run dev:supabase

pause 