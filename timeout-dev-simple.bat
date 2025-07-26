@echo off 
echo Starting dev server with timeout... 
start "Dev Server" cmd /c "npm run dev ^& timeout /t 30 /nobreak ^& taskkill /f /im node.exe" 
echo Dev server started with 30-second timeout 
