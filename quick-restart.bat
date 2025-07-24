@echo off
echo ========================================
echo ConstructBMS - Quick Restart
echo ========================================
echo.

echo [1/4] Stopping all processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ Processes stopped

echo.
echo [2/4] Starting backend server...
start /b npm run server
echo ✓ Backend server started in background

echo.
echo [3/4] Waiting for backend...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting frontend server...
start /b npm run dev
echo ✓ Frontend server started in background

echo.
echo ========================================
echo ✓ Quick restart complete!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo.
echo Opening application...
timeout /t 3 /nobreak >nul
start http://localhost:5173 