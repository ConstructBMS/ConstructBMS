@echo off
echo Testing environment...
echo.
echo 1. Testing Node.js...
node --version
echo.
echo 2. Testing npm...
npm --version
echo.
echo 3. Testing Git...
git --version
echo.
echo 4. Testing PowerShell...
powershell -Command "Write-Host 'PowerShell working'"
echo.
echo Environment test completed.
pause 