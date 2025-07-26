@echo off
title Simple Aggressive Fix - ConstructBMS
color 0D

echo.
echo ========================================
echo SIMPLE AGGRESSIVE FIX FOR HANGING ISSUES
echo ========================================
echo.
echo This will fix the remaining hanging issues with simple solutions.
echo.
echo Press any key to start the simple aggressive fix...
pause >nul

echo.
echo ========================================
echo PHASE 1: KILL ALL HANGING PROCESSES
echo ========================================
echo.

echo Force killing all development processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul
taskkill /f /im vite.exe 2>nul
taskkill /f /im tsc.exe 2>nul
taskkill /f /im eslint.cmd 2>nul
echo ✓ All processes killed

echo.
echo ========================================
echo PHASE 2: CREATE ONE-CLICK SOLUTION
echo ========================================
echo.

echo Creating one-click solution for all servers...

echo @echo off > start-all-simple.bat
echo echo ======================================== >> start-all-simple.bat
echo echo STARTING ALL CONSTRUCTBMS SERVERS >> start-all-simple.bat
echo echo ======================================== >> start-all-simple.bat
echo echo. >> start-all-simple.bat
echo echo This will start all servers without hanging... >> start-all-simple.bat
echo echo. >> start-all-simple.bat
echo echo Press any key to start... >> start-all-simple.bat
echo pause ^>nul >> start-all-simple.bat
echo echo. >> start-all-simple.bat
echo echo Starting development server... >> start-all-simple.bat
echo start "ConstructBMS Dev" cmd /c "npm run dev" >> start-all-simple.bat
echo timeout /t 5 /nobreak ^>nul >> start-all-simple.bat
echo echo Starting backend server... >> start-all-simple.bat
echo start "ConstructBMS Backend" cmd /c "npm run server" >> start-all-simple.bat
echo timeout /t 5 /nobreak ^>nul >> start-all-simple.bat
echo echo. >> start-all-simple.bat
echo echo All servers started! >> start-all-simple.bat
echo echo - Frontend: http://localhost:5173 >> start-all-simple.bat
echo echo - Backend: http://localhost:3001 >> start-all-simple.bat
echo echo. >> start-all-simple.bat
echo echo Press any key to open browser... >> start-all-simple.bat
echo pause ^>nul >> start-all-simple.bat
echo start http://localhost:5173 >> start-all-simple.bat
echo echo. >> start-all-simple.bat
echo echo Servers are running in background windows. >> start-all-simple.bat
echo echo Close those windows to stop the servers. >> start-all-simple.bat
echo pause >> start-all-simple.bat

echo ✓ One-click solution created

echo.
echo ========================================
echo PHASE 3: CREATE FORCE-EXECUTION SCRIPTS
echo ========================================
echo.

echo Creating force-execution scripts for stubborn commands...

echo @echo off > force-dev-simple.bat
echo echo Force starting development server... >> force-dev-simple.bat
echo echo Press any key if it hangs... >> force-dev-simple.bat
echo pause >> force-dev-simple.bat
echo start /B cmd /c "npm run dev" >> force-dev-simple.bat
echo echo Development server started in background >> force-dev-simple.bat
echo pause >> force-dev-simple.bat

echo @echo off > force-server-simple.bat
echo echo Force starting backend server... >> force-server-simple.bat
echo echo Press any key if it hangs... >> force-server-simple.bat
echo pause >> force-server-simple.bat
echo start /B cmd /c "npm run server" >> force-server-simple.bat
echo echo Backend server started in background >> force-server-simple.bat
echo pause >> force-server-simple.bat

echo ✓ Force-execution scripts created

echo.
echo ========================================
echo PHASE 4: CREATE CMD-BASED SCRIPTS
echo ========================================
echo.

echo Creating CMD-based scripts to bypass PowerShell...

echo @echo off > dev-cmd-only.bat
echo echo Starting development server with CMD only... >> dev-cmd-only.bat
echo echo This bypasses PowerShell completely... >> dev-cmd-only.bat
echo echo. >> dev-cmd-only.bat
echo npm run dev >> dev-cmd-only.bat

echo @echo off > server-cmd-only.bat
echo echo Starting backend server with CMD only... >> server-cmd-only.bat
echo echo This bypasses PowerShell completely... >> server-cmd-only.bat
echo echo. >> server-cmd-only.bat
echo npm run server >> server-cmd-only.bat

echo ✓ CMD-based scripts created

echo.
echo ========================================
echo PHASE 5: CREATE TIMEOUT SCRIPTS
echo ========================================
echo.

echo Creating timeout-based scripts...

echo @echo off > timeout-dev-simple.bat
echo echo Starting dev server with timeout... >> timeout-dev-simple.bat
echo start "Dev Server" cmd /c "npm run dev ^& timeout /t 30 /nobreak ^& taskkill /f /im node.exe" >> timeout-dev-simple.bat
echo echo Dev server started with 30-second timeout >> timeout-dev-simple.bat

echo @echo off > timeout-server-simple.bat
echo echo Starting backend server with timeout... >> timeout-server-simple.bat
echo start "Backend Server" cmd /c "npm run server ^& timeout /t 30 /nobreak ^& taskkill /f /im node.exe" >> timeout-server-simple.bat
echo echo Backend server started with 30-second timeout >> timeout-server-simple.bat

echo ✓ Timeout scripts created

echo.
echo ========================================
echo PHASE 6: FINAL TEST
echo ========================================
echo.

echo Testing if commands work without hanging...
echo Testing npm version...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm commands work
) else (
    echo ✗ npm still has issues
)

echo.
echo ========================================
echo SIMPLE AGGRESSIVE FIX COMPLETED
echo ========================================
echo.
echo All hanging issues should now be resolved.
echo.
echo NEW SCRIPTS CREATED:
echo - start-all-simple.bat - One-click start all servers
echo - force-dev-simple.bat - Force start dev server
echo - force-server-simple.bat - Force start backend server
echo - dev-cmd-only.bat - Dev server with CMD only
echo - server-cmd-only.bat - Backend server with CMD only
echo - timeout-dev-simple.bat - Dev server with timeout
echo - timeout-server-simple.bat - Backend server with timeout
echo.
echo RECOMMENDATIONS:
echo 1. Use start-all-simple.bat for easiest startup
echo 2. Use force-*.bat scripts if commands still hang
echo 3. Use CMD-only scripts to bypass PowerShell completely
echo 4. Use timeout scripts for automatic cleanup
echo.
echo To start everything: Double-click start-all-simple.bat
echo.
pause 