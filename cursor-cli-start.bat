@echo off
title Cursor CLI Start - ConstructBMS
color 0C

echo.
echo ========================================
echo CURSOR CLI START - INTEGRATED TERMINAL
echo ========================================
echo.
echo This will use Cursor CLI to open the project and start servers.
echo.

echo Checking for Cursor CLI...
where cursor >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Cursor CLI found
    echo.
    echo Opening project in Cursor IDE...
    cursor "C:\Users\info\Desktop\ConstructBMS"
    
    echo.
    echo ========================================
    echo CURSOR IDE OPENED - NEXT STEPS
    echo ========================================
    echo.
    echo Cursor IDE should now be open with your project.
    echo.
    echo To start servers in the integrated terminal:
    echo.
    echo 1. Open integrated terminal (Ctrl + `)
    echo 2. Run: npm run dev
    echo 3. Open new terminal tab (Ctrl + Shift + `)
    echo 4. Run: npm run server
    echo.
    echo Servers will run in integrated terminal tabs.
    echo.
) else (
    echo ✗ Cursor CLI not found
    echo.
    echo Trying alternative method...
    echo.
    echo Opening Cursor IDE manually...
    start "" "C:\Users\%USERNAME%\AppData\Local\Programs\Cursor\Cursor.exe" "C:\Users\info\Desktop\ConstructBMS"
    
    echo.
    echo ========================================
    echo MANUAL CURSOR OPEN - NEXT STEPS
    echo ========================================
    echo.
    echo Cursor IDE should now be open with your project.
    echo.
    echo To start servers in the integrated terminal:
    echo.
    echo 1. Open integrated terminal (Ctrl + `)
    echo 2. Run: npm run dev
    echo 3. Open new terminal tab (Ctrl + Shift + `)
    echo 4. Run: npm run server
    echo.
    echo Servers will run in integrated terminal tabs.
    echo.
)

echo ========================================
echo SERVER URLs
echo ========================================
echo.
echo Once both commands are running:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:3001
echo.
echo ========================================
echo INTEGRATED TERMINAL BENEFITS
echo ========================================
echo.
echo ✓ Servers run in Cursor IDE terminal tabs
echo ✓ No separate popup windows
echo ✓ Easy to switch between servers
echo ✓ Integrated with your development workflow
echo ✓ Can see server logs alongside your code
echo.
pause 