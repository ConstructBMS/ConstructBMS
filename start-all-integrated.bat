@echo off
title Start All Servers - Integrated Terminal
color 0A

echo.
echo ========================================
echo STARTING ALL SERVERS - INTEGRATED TERMINAL
echo ========================================
echo.
echo This script will help you start servers in Cursor IDE's integrated terminal.
echo No separate windows will be created.
echo.

echo Opening Cursor IDE with project...
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Cursor\Cursor.exe" "C:\Users\info\Desktop\ConstructBMS"

echo.
echo Waiting for Cursor IDE to open...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo INTEGRATED TERMINAL INSTRUCTIONS
echo ========================================
echo.
echo Cursor IDE should now be open. Follow these steps:
echo.
echo STEP 1: Open Integrated Terminal
echo - Press: Ctrl + ` (backtick key)
echo - Or go to: Terminal > New Terminal
echo.
echo STEP 2: Start Frontend Server
echo In the terminal, run:
echo   npm run dev
echo.
echo STEP 3: Open New Terminal Tab
echo - Press: Ctrl + Shift + `
echo - Or click the + button in terminal panel
echo.
echo STEP 4: Start Backend Server
echo In the new terminal tab, run:
echo   npm run server
echo.
echo ========================================
echo SERVER URLs
echo ========================================
echo.
echo Once both commands are running:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:3001
echo.
echo ========================================
echo BENEFITS OF INTEGRATED TERMINAL
echo ========================================
echo.
echo ✓ No separate popup windows
echo ✓ Servers run in Cursor IDE terminal tabs
echo ✓ Easy to switch between frontend and backend
echo ✓ See server logs alongside your code
echo ✓ Integrated development experience
echo ✓ Can use Cursor's terminal features
echo.
echo ========================================
echo QUICK COMMANDS TO COPY
echo ========================================
echo.
echo Frontend (Terminal Tab 1):
echo npm run dev
echo.
echo Backend (Terminal Tab 2):
echo npm run server
echo.
echo ========================================
echo TROUBLESHOOTING
echo ========================================
echo.
echo If servers don't start:
echo 1. Make sure you're in the correct directory
echo 2. Run: cd C:\Users\info\Desktop\ConstructBMS
echo 3. Then run the npm commands
echo.
echo If Cursor IDE doesn't open:
echo 1. Check if Cursor is installed
echo 2. Try opening it manually
echo.
echo Press any key to continue...
pause 