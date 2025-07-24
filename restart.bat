@echo off
echo ========================================
echo ConstructBMS - Complete Restart & Rebuild
echo ========================================
echo.

echo [1/6] Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ All Node.js processes stopped

echo.
echo [2/6] Cleaning build artifacts...
if exist "dist" rmdir /s /q "dist"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
echo ✓ Build artifacts cleaned

echo.
echo [3/6] Reinstalling dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [4/6] Starting backend server...
start /b npm run server

echo.
echo [5/6] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [6/6] Starting frontend development server...
start /b npm run dev

echo.
echo ========================================
echo ✓ Restart complete!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Servers are running in background.
echo Press any key to open the application...
pause >nul
start http://localhost:5173 