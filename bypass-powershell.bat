@echo off
echo ========================================
echo BYPASSING POWERSHELL - USING CMD DIRECTLY
echo ========================================
echo.

echo This script bypasses PowerShell and uses CMD directly
echo to avoid hanging issues.
echo.

echo 1. Testing basic CMD commands...
echo Current directory: %cd%
echo Current time: %time%
echo Current date: %date%
echo.

echo 2. Testing Node.js...
node --version
if %errorlevel% equ 0 (
    echo ✓ Node.js is working
) else (
    echo ✗ Node.js is not working
)
echo.

echo 3. Testing npm...
npm --version
if %errorlevel% equ 0 (
    echo ✓ npm is working
) else (
    echo ✗ npm is not working
)
echo.

echo 4. Checking project status...
if exist package.json (
    echo ✓ package.json exists
) else (
    echo ✗ package.json missing
)

if exist node_modules (
    echo ✓ node_modules exists
) else (
    echo ✗ node_modules missing
)
echo.

echo 5. Testing npm commands...
echo Testing npm list...
npm list --depth=0
echo.

echo 6. Testing development server...
echo Starting development server (will run in background)...
start /B npm run dev
echo.

echo 7. Waiting 10 seconds for server to start...
timeout /t 10 /nobreak >nul

echo 8. Checking if server is running...
netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo ✓ Development server is running on port 5173
) else (
    echo ✗ Development server not running on port 5173
)
echo.

echo ========================================
echo CMD BYPASS COMPLETED
echo ========================================
echo.
echo If the server is running, you can access it at:
echo http://localhost:5173
echo.
echo To stop the server, use: taskkill /f /im node.exe
echo.
pause 