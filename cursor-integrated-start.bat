@echo off
title Cursor Integrated Start - ConstructBMS
color 0A

echo.
echo ========================================
echo STARTING SERVERS IN CURSOR IDE TERMINAL
echo ========================================
echo.
echo This will start servers in Cursor IDE's integrated terminal.
echo.
echo Press any key to start...
pause >nul

echo.
echo ========================================
echo STARTING DEVELOPMENT SERVER
echo ========================================
echo.

echo Starting development server in Cursor IDE terminal...
echo.
echo To start the development server in Cursor IDE:
echo 1. Open Cursor IDE
echo 2. Open the integrated terminal (Ctrl + `)
echo 3. Run: npm run dev
echo.
echo The server will start in the integrated terminal window.
echo.

echo ========================================
echo STARTING BACKEND SERVER
echo ========================================
echo.

echo Starting backend server in Cursor IDE terminal...
echo.
echo To start the backend server in Cursor IDE:
echo 1. Open a new terminal tab in Cursor IDE (Ctrl + Shift + `)
echo 2. Run: npm run server
echo.
echo The backend server will start in the integrated terminal.
echo.

echo ========================================
echo SERVERS READY TO START
echo ========================================
echo.
echo Both servers are ready to start in Cursor IDE:
echo.
echo Frontend Server:
echo - Command: npm run dev
echo - URL: http://localhost:5173
echo.
echo Backend Server:
echo - Command: npm run server
echo - URL: http://localhost:3001
echo.
echo Instructions:
echo 1. Open Cursor IDE
echo 2. Open integrated terminal (Ctrl + `)
echo 3. Run: npm run dev
echo 4. Open new terminal tab (Ctrl + Shift + `)
echo 5. Run: npm run server
echo.
echo Both servers will run in the integrated terminal tabs.
echo.
pause 