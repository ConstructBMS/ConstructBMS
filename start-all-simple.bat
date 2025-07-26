@echo off 
echo ======================================== 
echo STARTING ALL CONSTRUCTBMS SERVERS 
echo ======================================== 
echo. 
echo This will start all servers without hanging... 
echo. 
echo Press any key to start... 
pause >nul 
echo. 
echo Starting development server... 
start "ConstructBMS Dev" cmd /c "npm run dev" 
timeout /t 5 /nobreak >nul 
echo Starting backend server... 
start "ConstructBMS Backend" cmd /c "npm run server" 
timeout /t 5 /nobreak >nul 
echo. 
echo All servers started! 
echo - Frontend: http://localhost:5173 
echo - Backend: http://localhost:3001 
echo. 
echo Press any key to open browser... 
pause >nul 
start http://localhost:5173 
echo. 
echo Servers are running in background windows. 
echo Close those windows to stop the servers. 
pause 
