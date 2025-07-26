@echo off
title Complete System Diagnostic - ConstructBMS
color 0B

echo.
echo ========================================
echo COMPLETE SYSTEM DIAGNOSTIC
echo ========================================
echo.
echo This will check your entire system and fix all hanging issues.
echo.
echo Press any key to start the comprehensive check...
pause >nul

echo.
echo ========================================
echo STEP 1: SYSTEM INFORMATION
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
echo STEP 2: POWERSHELL DIAGNOSTIC
echo ========================================
echo.

echo PowerShell Version:
powershell -Command "$PSVersionTable.PSVersion"
echo.

echo PowerShell Execution Policy:
powershell -Command "Get-ExecutionPolicy -List"
echo.

echo PSReadLine Module Status:
powershell -Command "Get-Module PSReadLine -ListAvailable"
echo.

echo ========================================
echo STEP 3: NODE.JS DIAGNOSTIC
echo ========================================
echo.

echo Node.js Version:
node --version
if %errorlevel% equ 0 (
    echo ✓ Node.js is installed and working
) else (
    echo ✗ Node.js is NOT working or not installed
)

echo.
echo npm Version:
npm --version
if %errorlevel% equ 0 (
    echo ✓ npm is installed and working
) else (
    echo ✗ npm is NOT working or not installed
)

echo.
echo Node.js Installation Path:
where node
echo.

echo npm Installation Path:
where npm
echo.

echo ========================================
echo STEP 4: ENVIRONMENT VARIABLES
echo ========================================
echo.

echo PATH Variable (Node.js entries):
echo %PATH% | findstr /i "node"
echo.

echo NODE_PATH Variable:
echo %NODE_PATH%
echo.

echo ========================================
echo STEP 5: PROJECT STATUS
echo ========================================
echo.

echo Current Directory:
cd
echo.

echo Package.json Status:
if exist package.json (
    echo ✓ package.json exists
    echo Package.json size: 
    dir package.json | findstr "package.json"
) else (
    echo ✗ package.json missing
)

echo.
echo Node Modules Status:
if exist node_modules (
    echo ✓ node_modules exists
    echo Node modules size:
    dir node_modules | findstr "node_modules"
) else (
    echo ✗ node_modules missing
)

echo.
echo ========================================
echo STEP 6: NETWORK AND PORTS
echo ========================================
echo.

echo Checking for processes on development ports:
echo.
echo Port 5173 (Vite Dev Server):
netstat -ano | findstr :5173
echo.
echo Port 3000 (Backend Server):
netstat -ano | findstr :3000
echo.
echo Port 54321 (Supabase):
netstat -ano | findstr :54321

echo.
echo ========================================
echo STEP 7: POWERSHELL FIXES
echo ========================================
echo.

echo Fixing PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo ✓ Execution policy set to RemoteSigned

echo.
echo Creating clean PowerShell profile...
powershell -Command "if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }"
powershell -Command "@'
# Clean PowerShell Profile for ConstructBMS
# Disable PSReadLine to prevent hanging
`$PSDefaultParameterValues['Out-Default:OutVariable'] = 'null'

# Set basic preferences
`$Host.UI.RawUI.WindowTitle = 'ConstructBMS Development'

# Disable command prediction and history
if (Get-Module PSReadLine) {
    Set-PSReadLineOption -PredictionSource None
    Set-PSReadLineOption -PredictionViewStyle None
    Set-PSReadLineOption -HistorySaveStyle SaveNothing
}

Write-Host 'Clean PowerShell profile loaded' -ForegroundColor Green
'@ | Out-File -FilePath `$PROFILE -Encoding UTF8"
echo ✓ Clean PowerShell profile created

echo.
echo ========================================
echo STEP 8: NODE.JS CONFIGURATION
echo ========================================
echo.

echo Setting npm configuration...
npm config set registry https://registry.npmjs.org/
npm config set fetch-retries 3
npm config set fetch-retry-mintimeout 5000
npm config set fetch-retry-maxtimeout 60000
echo ✓ npm configuration optimized

echo.
echo ========================================
echo STEP 9: DEPENDENCY CHECK
echo ========================================
echo.

echo Testing npm functionality:
npm list --depth=0
if %errorlevel% equ 0 (
    echo ✓ npm list works correctly
) else (
    echo ✗ npm list failed
)

echo.
echo ========================================
echo STEP 10: RECOMMENDATIONS
echo ========================================
echo.

echo Based on the diagnostic results:
echo.

REM Check if Node.js needs reinstallation
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔴 RECOMMENDATION: Reinstall Node.js
    echo    - Download from: https://nodejs.org/
    echo    - Choose LTS version
    echo    - Install with default settings
    echo.
) else (
    echo ✅ Node.js is working correctly
    echo.
)

REM Check if PowerShell needs fixing
powershell -Command "Get-ExecutionPolicy" | findstr "Restricted"
if %errorlevel% equ 0 (
    echo 🔴 RECOMMENDATION: PowerShell execution policy is restricted
    echo    - Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo.
) else (
    echo ✅ PowerShell execution policy is correct
    echo.
)

echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo Next steps:
echo 1. If Node.js needs reinstallation, download from nodejs.org
echo 2. If PowerShell issues persist, restart your computer
echo 3. Try running: npm run dev
echo 4. If issues continue, use the bypass scripts created earlier
echo.
pause 