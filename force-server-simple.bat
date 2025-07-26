@echo off 
echo Force starting backend server... 
echo Press any key if it hangs... 
pause 
start /B cmd /c "npm run server" 
echo Backend server started in background 
pause 
