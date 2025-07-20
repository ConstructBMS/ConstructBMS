@echo off
echo ========================================
echo    ConstructBMS Server Status
echo ========================================
echo.

echo Checking Node.js processes...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo ✓ Node.js processes are running
    echo.
    echo Active processes:
    tasklist /fi "imagename eq node.exe" /fo table
) else (
    echo ℹ No Node.js processes are running
)

echo.
echo Checking ports...
echo.

netstat -an | findstr ":3001" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend port 3001 is in use
) else (
    echo ℹ Backend port 3001 is free
)

netstat -an | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend port 5173 is in use
) else (
    echo ℹ Frontend port 5173 is free
)

echo.
echo ========================================
echo. 