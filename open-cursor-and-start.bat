@echo off
title Open Cursor IDE and Start Servers
color 0B

echo.
echo ========================================
echo OPENING CURSOR IDE AND STARTING SERVERS
echo ========================================
echo.
echo This will open Cursor IDE and prepare commands for the integrated terminal.
echo.

echo Opening Cursor IDE...
start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Cursor\Cursor.exe" "C:\Users\info\Desktop\ConstructBMS"

echo.
echo Waiting for Cursor IDE to open...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo CURSOR IDE INTEGRATED TERMINAL COMMANDS
echo ========================================
echo.
echo Cursor IDE should now be open. Follow these steps:
echo.
echo 1. Open the integrated terminal in Cursor IDE:
echo    - Press: Ctrl + ` (backtick)
echo    - Or go to: Terminal > New Terminal
echo.
echo 2. In the first terminal tab, run:
echo    npm run dev
echo.
echo 3. Open a new terminal tab:
echo    - Press: Ctrl + Shift + `
echo    - Or click the + button in the terminal panel
echo.
echo 4. In the second terminal tab, run:
echo    npm run server
echo.
echo ========================================
echo SERVER URLs
echo ========================================
echo.
echo Once both commands are running:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:3001
echo.
echo The servers will run in the integrated terminal tabs.
echo You can switch between them using the terminal tabs.
echo.
echo Press any key to continue...
pause >nul

echo.
echo ========================================
echo ALTERNATIVE: QUICK COMMANDS
echo ========================================
echo.
echo If you prefer, you can copy and paste these commands:
echo.
echo For Frontend (Terminal Tab 1):
echo npm run dev
echo.
echo For Backend (Terminal Tab 2):
echo npm run server
echo.
echo ========================================
echo TROUBLESHOOTING
echo ========================================
echo.
echo If the servers don't start:
echo 1. Make sure you're in the correct directory
echo 2. Try: cd C:\Users\info\Desktop\ConstructBMS
echo 3. Then run the npm commands
echo.
echo If Cursor IDE doesn't open:
echo 1. Check if Cursor is installed
echo 2. Try opening it manually and navigate to the project
echo.
pause 