@echo off
echo Quick Fix for ConstructBMS Issues
echo ================================

echo.
echo 1. Setting PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Execution policy set successfully
) else (
    echo ⚠ Execution policy setting failed (may need admin rights)
)

echo.
echo 2. Testing ESLint...
call npm run lint:simple 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ ESLint is working
) else (
    echo ⚠ ESLint has issues - trying to fix...
    call npm run lint:simple:fix 2>nul
)

echo.
echo 3. Testing Git...
git status 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Git is working
) else (
    echo ❌ Git has issues
)

echo.
echo 4. Creating simple batch files...

echo @echo off > lint-quick.bat
echo call npm run lint:simple >> lint-quick.bat
echo pause >> lint-quick.bat

echo @echo off > lint-fix-quick.bat
echo call npm run lint:simple:fix >> lint-fix-quick.bat
echo pause >> lint-fix-quick.bat

echo @echo off > git-quick.bat
echo git add . >> git-quick.bat
echo git commit -m "Auto-save: %date% %time%" >> git-quick.bat
echo git push >> git-quick.bat
echo pause >> git-quick.bat

echo ✓ Created quick batch files: lint-quick.bat, lint-fix-quick.bat, git-quick.bat

echo.
echo Quick fix completed!
echo.
echo You can now use:
echo   • lint-quick.bat - for ESLint checking
echo   • lint-fix-quick.bat - for ESLint auto-fixing
echo   • git-quick.bat - for quick git commits
echo.
pause 