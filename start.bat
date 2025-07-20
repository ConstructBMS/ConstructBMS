@echo off
echo ========================================
echo    ConstructBMS Auto Startup
echo ========================================
echo.

echo Stopping any existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting servers...
echo.

echo Starting backend server...
start /b cmd /c "npm run server"
timeout /t 3 /nobreak >nul

echo Starting frontend server...
start /b cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo    🎉 Servers Started Successfully!
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
echo Use 'stop.bat' to stop all servers
echo. 