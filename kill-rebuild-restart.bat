@echo off
echo ========================================
echo KILL - REBUILD - RESTART ALL SERVERS
echo ========================================
echo.

echo STEP 1: KILLING ALL PROCESSES
echo ==============================
echo.

echo Killing Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed Node.js processes
) else (
    echo - No Node.js processes found
)

echo Killing npm processes...
taskkill /f /im npm.cmd 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed npm processes
) else (
    echo - No npm processes found
)

echo Killing Vite processes...
taskkill /f /im vite.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed Vite processes
) else (
    echo - No Vite processes found
)

echo Killing TypeScript processes...
taskkill /f /im tsc.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed TypeScript processes
) else (
    echo - No TypeScript processes found
)

echo Killing ESLint processes...
taskkill /f /im eslint.cmd 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed ESLint processes
) else (
    echo - No ESLint processes found
)

echo.
echo Waiting 3 seconds for processes to fully terminate...
timeout /t 3 /nobreak >nul
echo.

echo STEP 2: CLEARING CACHES AND REBUILDING
echo ======================================
echo.

echo Clearing npm cache...
npm cache clean --force
echo ✓ npm cache cleared

echo.
echo Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed node_modules
) else (
    echo - No node_modules to remove
)

echo.
echo Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✓ Removed package-lock.json
) else (
    echo - No package-lock.json to remove
)

echo.
echo Clearing additional caches...
if exist .vite (
    rmdir /s /q .vite
    echo ✓ Removed .vite cache
)
if exist dist (
    rmdir /s /q dist
    echo ✓ Removed dist folder
)
if exist build (
    rmdir /s /q build
    echo ✓ Removed build folder
)

echo.
echo STEP 3: REINSTALLING DEPENDENCIES
echo ================================
echo.

echo Installing dependencies (this may take several minutes)...
npm install
if %errorlevel% equ 0 (
    echo ✓ Dependencies installed successfully
) else (
    echo ✗ Dependency installation failed
    pause
    exit /b 1
)

echo.
echo STEP 4: VERIFYING INSTALLATION
echo ==============================
echo.

echo Testing Node.js...
node --version
if %errorlevel% equ 0 (
    echo ✓ Node.js is working
) else (
    echo ✗ Node.js is not working
)

echo.
echo Testing npm...
npm --version
if %errorlevel% equ 0 (
    echo ✓ npm is working
) else (
    echo ✗ npm is not working
)

echo.
echo Testing key dependencies...
if exist node_modules\react (
    echo ✓ React installed
) else (
    echo ✗ React missing
)

if exist node_modules\vite (
    echo ✓ Vite installed
) else (
    echo ✗ Vite missing
)

if exist node_modules\typescript (
    echo ✓ TypeScript installed
) else (
    echo ✗ TypeScript missing
)

echo.
echo STEP 5: STARTING ALL SERVERS
echo ============================
echo.

echo Starting development server...
start "ConstructBMS Dev Server" cmd /k "npm run dev"

echo.
echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Checking if development server is running...
netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo ✓ Development server is running on port 5173
) else (
    echo ✗ Development server not running on port 5173
)

echo.
echo Starting backend server (if available)...
if exist server\index.cjs (
    start "ConstructBMS Backend Server" cmd /k "npm run server"
    echo ✓ Backend server started
) else (
    echo - No backend server found
)

echo.
echo Starting Supabase server (if available)...
if exist server\index-supabase.cjs (
    start "ConstructBMS Supabase Server" cmd /k "npm run server:supabase"
    echo ✓ Supabase server started
) else (
    echo - No Supabase server found
)

echo.
echo STEP 6: FINAL STATUS CHECK
echo ==========================
echo.

echo Checking all running servers...
echo.
echo Development server (port 5173):
netstat -ano | findstr :5173
echo.
echo Backend server (port 3000):
netstat -ano | findstr :3000
echo.
echo Supabase server (port 54321):
netstat -ano | findstr :54321

echo.
echo ========================================
echo KILL - REBUILD - RESTART COMPLETED
echo ========================================
echo.
echo Servers should now be running:
echo - Development server: http://localhost:5173
echo - Backend server: http://localhost:3000 (if available)
echo - Supabase server: http://localhost:54321 (if available)
echo.
echo To stop all servers, run: taskkill /f /im node.exe
echo.
pause 