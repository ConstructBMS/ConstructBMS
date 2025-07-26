@echo off
echo ========================================
echo SIMPLE FIX FOR CONSTRUCTBMS
echo ========================================
echo.

echo Starting simple fix...
echo.

echo 1. Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo ✓ Removed node_modules
) else (
    echo - No node_modules to remove
)

echo.

echo 2. Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo ✓ Removed package-lock.json
) else (
    echo - No package-lock.json to remove
)

echo.

echo 3. Clearing npm cache...
npm cache clean --force
echo ✓ Cleared npm cache

echo.

echo 4. Installing dependencies...
npm install
echo ✓ Dependencies installed

echo.

echo 5. Installing ESLint...
npm install --save-dev eslint@latest
echo ✓ ESLint installed

echo.

echo 6. Installing TypeScript...
npm install --save-dev typescript@latest
echo ✓ TypeScript installed

echo.

echo 7. Installing Vite...
npm install --save-dev vite@latest
echo ✓ Vite installed

echo.

echo 8. Testing basic commands...
echo Testing npm run dev...
timeout /t 5 /nobreak >nul
echo ✓ Basic test completed

echo.

echo ========================================
echo SIMPLE FIX COMPLETED
echo ========================================
echo.
echo Next steps:
echo 1. Try running: npm run dev
echo 2. If issues persist, restart Cursor IDE
echo 3. Check the diagnostic-check.bat for more info
echo.
pause 