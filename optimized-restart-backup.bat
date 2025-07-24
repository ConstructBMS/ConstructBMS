@echo off
echo ========================================
echo ConstructBMS - Optimized Restart
echo ========================================
echo.

echo [1/4] Stopping Node processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo ✓ Processes stopped

echo.
echo [2/4] Quick cache cleanup...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" >nul 2>&1
if exist "dist" rmdir /s /q "dist" >nul 2>&1
echo ✓ Cache cleaned

echo.
echo [3/4] Starting servers...
start /b cmd /c "npm run server"
timeout /t 3 /nobreak >nul
start /b cmd /c "npm run dev"

echo.
echo [4/4] Waiting for servers to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo ✓ OPTIMIZED RESTART COMPLETE!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Opening application...
timeout /t 1 /nobreak >nul
start http://localhost:5173
echo.
echo Ready! 🚀 