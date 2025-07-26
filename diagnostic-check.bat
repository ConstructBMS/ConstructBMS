@echo off
echo ========================================
echo DIAGNOSTIC CHECK FOR CONSTRUCTBMS
echo ========================================
echo.

echo Checking basic system status...
echo.

echo 1. Node.js version:
node --version
echo.

echo 2. NPM version:
npm --version
echo.

echo 3. Current directory:
cd
echo.

echo 4. Package.json exists:
if exist package.json (
    echo ✓ package.json found
) else (
    echo ✗ package.json missing
)

echo.

echo 5. Node modules exists:
if exist node_modules (
    echo ✓ node_modules found
) else (
    echo ✗ node_modules missing
)

echo.

echo 6. Key dependencies check:
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

echo 7. Testing npm list (first 10 lines):
npm list --depth=0 | head -10
echo.

echo 8. Testing npx commands:
echo ESLint version:
npx eslint --version
echo.

echo TypeScript version:
npx tsc --version
echo.

echo Vite version:
npx vite --version
echo.

echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
pause 