@echo off
echo ========================================
echo    Stopping ConstructBMS Servers
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Waiting for processes to stop...
timeout /t 2 /nobreak >nul

echo Checking if any processes remain...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo Force killing remaining processes...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 1 /nobreak >nul
) else (
    echo All processes stopped successfully.
)

echo.
echo ✓ All servers stopped
echo. 