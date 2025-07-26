@echo off
echo Running Comprehensive Fix for ConstructBMS
echo ==========================================
echo.
echo This will fix all root causes of hanging commands and ESLint issues.
echo.
echo 1. PowerShell execution policy and PSReadLine
echo 2. Node.js and npm configuration
echo 3. Git configuration
echo 4. ESLint configuration (full functionality)
echo 5. Package.json scripts cleanup
echo 6. .cursorignore optimization
echo 7. Cache clearing
echo 8. Dependency reinstallation
echo 9. Testing all fixes
echo 10. Cleanup of temporary files
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting comprehensive fix...
powershell -ExecutionPolicy Bypass -File comprehensive-fix.ps1

echo.
echo Comprehensive fix completed!
echo.
echo If you still experience issues, please restart your computer and try again.
pause 