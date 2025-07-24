@echo off
echo ========================================
echo    ConstructBMS Dev Environment
echo ========================================
echo.

echo Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting development servers...
echo.

echo Starting both servers using concurrently...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001/api/health
echo.

echo Demo Accounts:
echo   Super Admin: constructbms@gmail.com / ConstructBMS25
echo   Admin:       admin@constructbms.com / ConstructBMS25
echo   Employee:    employee@constructbms.com / ConstructBMS25
echo.

echo Use 'stop.bat' to stop all servers
echo.

npm run dev:concurrent 