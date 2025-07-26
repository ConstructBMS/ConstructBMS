@echo off
title ConstructBMS - Kill Rebuild Restart
color 0A

echo.
echo ========================================
echo CONSTRUCTBMS - KILL REBUILD RESTART
echo ========================================
echo.
echo This will kill all processes, rebuild everything, and restart servers.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo STEP 1: KILLING ALL PROCESSES
echo ==============================
echo.

taskkill /f /im node.exe 2>nul && echo ✓ Killed Node.js processes || echo - No Node.js processes found
taskkill /f /im npm.cmd 2>nul && echo ✓ Killed npm processes || echo - No npm processes found
taskkill /f /im vite.exe 2>nul && echo ✓ Killed Vite processes || echo - No Vite processes found
taskkill /f /im tsc.exe 2>nul && echo ✓ Killed TypeScript processes || echo - No TypeScript processes found
taskkill /f /im eslint.cmd 2>nul && echo ✓ Killed ESLint processes || echo - No ESLint processes found

echo.
echo Waiting for processes to terminate...
timeout /t 3 /nobreak >nul

echo.
echo STEP 2: CLEARING CACHES
echo =======================
echo.

npm cache clean --force
echo ✓ npm cache cleared

if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed node_modules
) else (
    echo - No node_modules to remove
)

if exist package-lock.json (
    del package-lock.json
    echo ✓ Removed package-lock.json
) else (
    echo - No package-lock.json to remove
)

if exist .vite (
    rmdir /s /q .vite
    echo ✓ Removed .vite cache
)

if exist dist (
    rmdir /s /q dist
    echo ✓ Removed dist folder
)

echo.
echo STEP 3: REINSTALLING DEPENDENCIES
echo =================================
echo.

echo Installing dependencies (this may take 5-10 minutes)...
echo Please wait...
echo.

npm install

if %errorlevel% equ 0 (
    echo.
    echo ✓ Dependencies installed successfully!
) else (
    echo.
    echo ✗ Dependency installation failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo STEP 4: STARTING SERVERS
echo ========================
echo.

echo Starting development server...
start "ConstructBMS Dev Server" cmd /k "npm run dev"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Checking server status...
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
echo ========================================
echo COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your servers should now be running:
echo - Development server: http://localhost:5173
echo - Backend server: http://localhost:3000 (if available)
echo.
echo To stop all servers later, run: taskkill /f /im node.exe
echo.
echo Press any key to open the development server in your browser...
pause >nul

start http://localhost:5173

echo.
echo Browser opened! Your ConstructBMS application should be loading.
echo.
echo If you need to stop all servers, run: taskkill /f /im node.exe
echo.
pause 