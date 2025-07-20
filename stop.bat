@echo off
echo ========================================
echo    Stopping ConstructBMS Servers
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Checking for remaining processes...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo Force killing remaining processes...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo.
echo ✓ All servers stopped
echo. 