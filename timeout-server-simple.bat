@echo off 
echo Starting backend server with timeout... 
start "Backend Server" cmd /c "npm run server ^& timeout /t 30 /nobreak ^& taskkill /f /im node.exe" 
echo Backend server started with 30-second timeout 
