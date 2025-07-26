@echo off 
echo Force starting development server... 
echo Press any key if it hangs... 
pause 
start /B cmd /c "npm run dev" 
echo Development server started in background 
pause 
