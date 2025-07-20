@echo off
echo ========================================
echo    ConstructBMS Server Startup
echo ========================================
echo.

:: Kill any existing Node processes
echo [1/5] Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Stopped existing Node processes
) else (
    echo    ℹ No existing processes found
)
echo.

:: Clean build artifacts
echo [2/5] Cleaning build artifacts...
if exist "node_modules" (
    rmdir /s /q "node_modules" >nul 2>&1
    echo    ✓ Removed node_modules
)
if exist "dist" (
    rmdir /s /q "dist" >nul 2>&1
    echo    ✓ Removed dist folder
)
if exist ".vite" (
    rmdir /s /q ".vite" >nul 2>&1
    echo    ✓ Removed .vite folder
)
echo.

:: Install dependencies
echo [3/5] Installing dependencies...
call npm install --silent
if %errorlevel% neq 0 (
    echo    ✗ Failed to install dependencies
    pause
    exit /b 1
)
echo    ✓ Dependencies installed
echo.

:: Start backend server in background
echo [4/5] Starting backend server...
start /b npm run server
timeout /t 3 /nobreak >nul
echo    ✓ Backend server started on port 3001
echo.

:: Start frontend server in background
echo [5/5] Starting frontend server...
start /b npm run dev
timeout /t 3 /nobreak >nul
echo    ✓ Frontend server started on port 5173
echo.

echo ========================================
echo    🎉 Servers are ready!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001/api/health
echo.
echo Demo Accounts:
echo   Super Admin: constructbms@gmail.com / ConstructBMS25
echo   Admin:       admin@constructbms.com / ConstructBMS25
echo   Employee:    employee@constructbms.com / ConstructBMS25
echo.
echo Press any key to close this window...
pause >nul 