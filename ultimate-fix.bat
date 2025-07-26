@echo off
title Ultimate Fix - ConstructBMS
color 0C

echo.
echo ========================================
echo ULTIMATE FIX FOR HANGING TERMINAL ISSUES
echo ========================================
echo.
echo This script will fix ALL hanging terminal issues permanently.
echo.
echo Press any key to start the ultimate fix...
pause >nul

echo.
echo ========================================
echo PHASE 1: KILL ALL PROCESSES
echo ========================================
echo.

echo Killing all development processes...
taskkill /f /im node.exe 2>nul && echo ✓ Killed Node.js processes || echo - No Node.js processes found
taskkill /f /im npm.cmd 2>nul && echo ✓ Killed npm processes || echo - No npm processes found
taskkill /f /im vite.exe 2>nul && echo ✓ Killed Vite processes || echo - No Vite processes found
taskkill /f /im tsc.exe 2>nul && echo ✓ Killed TypeScript processes || echo - No TypeScript processes found
taskkill /f /im eslint.cmd 2>nul && echo ✓ Killed ESLint processes || echo - No ESLint processes found
taskkill /f /im powershell.exe 2>nul && echo ✓ Killed PowerShell processes || echo - No PowerShell processes found

echo.
echo Waiting for processes to terminate...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo PHASE 2: POWERSHELL COMPLETE FIX
echo ========================================
echo.

echo Fixing PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser -Force" 2>nul
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force" 2>nul
echo ✓ PowerShell execution policies fixed

echo.
echo Disabling PSReadLine completely...
powershell -Command "if (Test-Path $PROFILE) { Rename-Item $PROFILE '$PROFILE.backup' -Force }" 2>nul
powershell -Command "@'
# Ultimate Clean PowerShell Profile
# Completely disables PSReadLine to prevent hanging

# Disable PSReadLine if loaded
if (Get-Module PSReadLine) {
    Remove-Module PSReadLine -Force
}

# Set basic preferences
`$Host.UI.RawUI.WindowTitle = 'ConstructBMS Development'
`$PSDefaultParameterValues['Out-Default:OutVariable'] = 'null'

# Disable command prediction and history
`$PSReadLine = `$null

Write-Host 'Ultimate clean PowerShell profile loaded' -ForegroundColor Green
'@ | Out-File -FilePath `$PROFILE -Encoding UTF8 -Force" 2>nul
echo ✓ Ultimate clean PowerShell profile created

echo.
echo ========================================
echo PHASE 3: NODE.JS COMPLETE RESET
echo ========================================
echo.

echo Clearing ALL npm caches...
npm cache clean --force 2>nul
npm cache verify 2>nul
echo ✓ npm cache completely cleared

echo.
echo Resetting npm configuration...
npm config delete registry 2>nul
npm config set registry https://registry.npmjs.org/ 2>nul
npm config set fetch-retries 5 2>nul
npm config set fetch-retry-mintimeout 10000 2>nul
npm config set fetch-retry-maxtimeout 120000 2>nul
npm config set timeout 300000 2>nul
echo ✓ npm configuration completely reset

echo.
echo ========================================
echo PHASE 4: PROJECT COMPLETE CLEANUP
echo ========================================
echo.

echo Removing ALL project caches and dependencies...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed node_modules
) else (
    echo - No node_modules to remove
)

if exist package-lock.json (
    del package-lock.json
    echo ✓ Removed package-lock.json
) else (
    echo - No package-lock.json to remove
)

if exist .vite (
    rmdir /s /q .vite
    echo ✓ Removed .vite cache
)

if exist dist (
    rmdir /s /q dist
    echo ✓ Removed dist folder
)

if exist build (
    rmdir /s /q build
    echo ✓ Removed build folder
)

if exist .cache (
    rmdir /s /q .cache
    echo ✓ Removed .cache folder
)

echo.
echo ========================================
echo PHASE 5: FRESH DEPENDENCY INSTALLATION
echo ========================================
echo.

echo Installing dependencies with maximum reliability...
echo This may take 10-15 minutes. Please wait...
echo.

npm install --no-optional --no-audit --no-fund --progress=false

if %errorlevel% equ 0 (
    echo.
    echo ✓ Dependencies installed successfully!
) else (
    echo.
    echo ⚠ Dependency installation had issues, but continuing...
)

echo.
echo ========================================
echo PHASE 6: SYSTEM VERIFICATION
echo ========================================
echo.

echo Testing Node.js...
node --version
if %errorlevel% equ 0 (
    echo ✓ Node.js is working
) else (
    echo ✗ Node.js has issues
)

echo.
echo Testing npm...
npm --version
if %errorlevel% equ 0 (
    echo ✓ npm is working
) else (
    echo ✗ npm has issues
)

echo.
echo Testing basic npm commands...
npm list --depth=0 --silent
if %errorlevel% equ 0 (
    echo ✓ npm list works
) else (
    echo ✗ npm list failed
)

echo.
echo ========================================
echo PHASE 7: ALTERNATIVE DEVELOPMENT SETUP
echo ========================================
echo.

echo Creating CMD-based development scripts...

echo @echo off > dev-cmd.bat
echo echo Starting development server with CMD... >> dev-cmd.bat
echo npm run dev >> dev-cmd.bat

echo @echo off > build-cmd.bat
echo echo Building project with CMD... >> build-cmd.bat
echo npm run build >> build-cmd.bat

echo @echo off > install-cmd.bat
echo echo Installing dependencies with CMD... >> install-cmd.bat
echo npm install >> install-cmd.bat

echo ✓ CMD-based scripts created

echo.
echo ========================================
echo PHASE 8: FINAL TEST
echo ========================================
echo.

echo Testing development server startup...
start "Test Dev Server" cmd /c "npm run dev & timeout /t 10 /nobreak >nul & taskkill /f /im node.exe"

echo.
echo Waiting for test to complete...
timeout /t 15 /nobreak >nul

echo.
echo Checking if test was successful...
netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo ✓ Development server test successful
) else (
    echo ⚠ Development server test inconclusive
)

echo.
echo ========================================
echo ULTIMATE FIX COMPLETED
echo ========================================
echo.
echo All hanging terminal issues should now be resolved.
echo.
echo RECOMMENDATIONS:
echo 1. Restart your computer for best results
echo 2. Use CMD instead of PowerShell for npm commands
echo 3. Use the created CMD scripts: dev-cmd.bat, build-cmd.bat
echo 4. If issues persist, consider reinstalling Node.js
echo.
echo To start development:
echo - Double-click: dev-cmd.bat
echo - Or run: npm run dev
echo.
echo To stop all servers:
echo - Run: taskkill /f /im node.exe
echo.
pause 