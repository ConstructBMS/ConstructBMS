@echo off
echo Fixing PowerShell Execution Policy...
echo.
echo This will open PowerShell as Administrator to fix the execution policy.
echo.
echo 1. A PowerShell window will open
echo 2. Run this command: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
echo 3. Type 'Y' when prompted
echo 4. Close PowerShell and return here
echo.
pause

echo Opening PowerShell as Administrator...
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command', 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; Read-Host \"Press Enter to continue\"'"

echo.
echo PowerShell execution policy should now be fixed.
echo You can test by running: powershell -Command "Get-ExecutionPolicy"
echo.
pause
