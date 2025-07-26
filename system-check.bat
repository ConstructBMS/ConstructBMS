@echo off
title System Check - ConstructBMS
color 0E

echo.
echo ========================================
echo COMPREHENSIVE SYSTEM CHECK
echo ========================================
echo.
echo This will check if you need to reinstall Node.js, npm, or other components.
echo.

echo ========================================
echo 1. WINDOWS SYSTEM CHECK
echo ========================================
echo.

echo Windows Version:
ver
echo.

echo System Architecture:
echo %PROCESSOR_ARCHITECTURE%
echo.

echo Available Memory:
wmic computersystem get TotalPhysicalMemory /format:value
echo.

echo ========================================
echo 2. NODE.JS INSTALLATION CHECK
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js is installed
    echo Node.js version:
    node --version
) else (
    echo ✗ Node.js is NOT installed or corrupted
    echo RECOMMENDATION: Install Node.js from https://nodejs.org/
)

echo.
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm is installed
    echo npm version:
    npm --version
) else (
    echo ✗ npm is NOT installed or corrupted
    echo RECOMMENDATION: Reinstall Node.js (includes npm)
)

echo.
echo Checking Node.js installation path...
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js is in PATH
    echo Node.js location:
    where node
) else (
    echo ✗ Node.js is NOT in PATH
    echo RECOMMENDATION: Reinstall Node.js
)

echo.
echo ========================================
echo 3. POWERSHELL CHECK
echo ========================================
echo.

echo PowerShell Version:
powershell -Command "$PSVersionTable.PSVersion" 2>nul
if %errorlevel% equ 0 (
    echo ✓ PowerShell is working
) else (
    echo ✗ PowerShell has issues
    echo RECOMMENDATION: Update Windows or use CMD instead
)

echo.
echo PowerShell Execution Policy:
powershell -Command "Get-ExecutionPolicy" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Execution policy is set
) else (
    echo ✗ Execution policy issues
    echo RECOMMENDATION: Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
)

echo.
echo ========================================
echo 4. ENVIRONMENT VARIABLES CHECK
echo ========================================
echo.

echo Checking PATH for Node.js entries:
echo %PATH% | findstr /i "node" >nul
if %errorlevel% equ 0 (
    echo ✓ Node.js is in PATH
) else (
    echo ✗ Node.js is NOT in PATH
    echo RECOMMENDATION: Reinstall Node.js
)

echo.
echo Checking NODE_PATH:
if defined NODE_PATH (
    echo ✓ NODE_PATH is set: %NODE_PATH%
) else (
    echo - NODE_PATH is not set (this is usually OK)
)

echo.
echo ========================================
echo 5. NETWORK AND CONNECTIVITY CHECK
echo ========================================
echo.

echo Testing npm registry connectivity...
npm config get registry >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm registry is accessible
    echo Registry: 
    npm config get registry
) else (
    echo ✗ npm registry is not accessible
    echo RECOMMENDATION: Check internet connection or firewall
)

echo.
echo ========================================
echo 6. PROJECT SPECIFIC CHECK
echo ========================================
echo.

echo Checking package.json:
if exist package.json (
    echo ✓ package.json exists
    echo Package.json size:
    dir package.json | findstr "package.json"
) else (
    echo ✗ package.json missing
    echo RECOMMENDATION: This is a critical file - check if you're in the right directory
)

echo.
echo Checking node_modules:
if exist node_modules (
    echo ✓ node_modules exists
    echo Node modules size:
    dir node_modules | findstr "node_modules"
) else (
    echo - node_modules missing (will be created during npm install)
)

echo.
echo ========================================
echo 7. FUNCTIONALITY TESTS
echo ========================================
echo.

echo Testing npm list command:
npm list --depth=0 --silent >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm list works correctly
) else (
    echo ✗ npm list failed
    echo RECOMMENDATION: Reinstall Node.js and npm
)

echo.
echo Testing npm cache:
npm cache verify >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm cache is working
) else (
    echo ✗ npm cache has issues
    echo RECOMMENDATION: Run: npm cache clean --force
)

echo.
echo ========================================
echo 8. FINAL RECOMMENDATIONS
echo ========================================
echo.

echo Based on the system check results:
echo.

REM Check if Node.js needs reinstallation
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔴 CRITICAL: Reinstall Node.js
    echo    - Download from: https://nodejs.org/
    echo    - Choose LTS version (currently 20.x)
    echo    - Install with default settings
    echo    - Restart computer after installation
    echo.
) else (
    echo ✅ Node.js is properly installed
    echo.
)

REM Check if npm needs fixing
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔴 CRITICAL: npm is not working
    echo    - Reinstall Node.js (includes npm)
    echo    - Or run: npm cache clean --force
    echo.
) else (
    echo ✅ npm is working correctly
    echo.
)

REM Check if PowerShell needs fixing
powershell -Command "Get-ExecutionPolicy" >nul 2>&1
if %errorlevel% neq 0 (
    echo 🟡 WARNING: PowerShell has issues
    echo    - Use CMD instead of PowerShell
    echo    - Or run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo.
) else (
    echo ✅ PowerShell is working correctly
    echo.
)

echo ========================================
echo SYSTEM CHECK COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. If Node.js needs reinstallation, download from nodejs.org
echo 2. If PowerShell has issues, use CMD instead
echo 3. Run the ultimate-fix.bat script after any reinstallations
echo 4. Restart your computer for best results
echo.
pause 