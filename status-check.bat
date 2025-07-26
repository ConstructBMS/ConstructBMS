@echo off
echo ========================================
echo COMPREHENSIVE STATUS CHECK
echo ========================================
echo.

echo 1. System Information:
echo Node version:
node --version
echo.
echo NPM version:
npm --version
echo.

echo 2. Project Status:
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

if exist package-lock.json (
    echo ✓ package-lock.json exists
) else (
    echo ✗ package-lock.json missing
)
echo.

echo 3. Key Dependencies:
if exist node_modules\react (
    echo ✓ React installed
) else (
    echo ✗ React missing
)

if exist node_modules\vite (
    echo ✓ Vite installed
) else (
    echo ✗ Vite missing
)

if exist node_modules\typescript (
    echo ✓ TypeScript installed
) else (
    echo ✗ TypeScript missing
)

if exist node_modules\eslint (
    echo ✓ ESLint installed
) else (
    echo ✗ ESLint missing
)
echo.

echo 4. Development Server Status:
netstat -ano | findstr :5173
if %errorlevel% equ 0 (
    echo ✓ Development server is running on port 5173
) else (
    echo ✗ Development server not running on port 5173
)
echo.

echo 5. Testing Basic Commands:
echo Testing npm list:
npm list --depth=0 2>nul
echo.

echo Testing npx eslint:
npx eslint --version 2>nul
echo.

echo Testing npx tsc:
npx tsc --version 2>nul
echo.

echo Testing npx vite:
npx vite --version 2>nul
echo.

echo 6. Available Scripts:
echo Available npm scripts:
npm run 2>nul
echo.

echo ========================================
echo STATUS CHECK COMPLETE
echo ========================================
pause 