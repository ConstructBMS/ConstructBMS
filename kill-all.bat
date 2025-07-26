@echo off
echo ========================================
echo KILLING ALL DEVELOPMENT PROCESSES
echo ========================================
echo.

echo Killing all Node.js related processes...

taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed Node.js processes
) else (
    echo - No Node.js processes found
)

taskkill /f /im npm.cmd 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed npm processes
) else (
    echo - No npm processes found
)

taskkill /f /im vite.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed Vite processes
) else (
    echo - No Vite processes found
)

taskkill /f /im tsc.exe 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed TypeScript processes
) else (
    echo - No TypeScript processes found
)

taskkill /f /im eslint.cmd 2>nul
if %errorlevel% equ 0 (
    echo ✓ Killed ESLint processes
) else (
    echo - No ESLint processes found
)

echo.
echo Checking for any remaining processes on development ports...

netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo Found process on port 5173 - killing it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do taskkill /f /pid %%a 2>nul
)

netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo Found process on port 3000 - killing it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a 2>nul
)

netstat -ano | findstr :54321
if %errorlevel% equ 0 (
    echo Found process on port 54321 - killing it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :54321') do taskkill /f /pid %%a 2>nul
)

echo.
echo ========================================
echo ALL PROCESSES KILLED
echo ========================================
echo.
echo You can now run: kill-rebuild-restart.bat
echo to rebuild and restart everything.
echo.
pause 