@echo off
echo ========================================
echo COMPREHENSIVE SYSTEM FIX FOR CONSTRUCTBMS
echo ========================================
echo.

echo Starting comprehensive system fix...
echo Timestamp: %date% %time%
echo.

echo 1. Checking system state...
node --version
npm --version
echo Current directory: %cd%
echo.

echo 2. Killing hanging processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul
taskkill /f /im vite.exe 2>nul
taskkill /f /im eslint.cmd 2>nul
taskkill /f /im tsc.exe 2>nul
echo Killed hanging processes
echo.

echo 3. Clearing caches...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json 2>nul
)

echo Clearing npm cache...
npm cache clean --force 2>nul
echo.

echo 4. Checking npm configuration...
npm config set registry https://registry.npmjs.org/ 2>nul
npm config set fetch-retries 3 2>nul
npm config set fetch-retry-mintimeout 5000 2>nul
npm config set fetch-retry-maxtimeout 60000 2>nul
echo.

echo 5. Reinstalling dependencies...
echo Installing dependencies with verbose output...
npm install --verbose --no-optional > npm-install.log 2>&1
echo Dependencies installed. Check npm-install.log for details.
echo.

echo 6. Installing ESLint...
echo Installing ESLint globally...
npm install -g eslint@latest 2>nul
echo Installing ESLint locally...
npm install --save-dev eslint@latest 2>nul
echo.

echo 7. Installing TypeScript...
echo Installing TypeScript globally...
npm install -g typescript@latest 2>nul
echo Installing TypeScript locally...
npm install --save-dev typescript@latest 2>nul
echo.

echo 8. Installing Vite...
echo Installing Vite globally...
npm install -g vite@latest 2>nul
echo Installing Vite locally...
npm install --save-dev vite@latest 2>nul
echo.

echo 9. Installing Tailwind CSS...
npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest 2>nul
echo.

echo 10. Verifying installations...
echo Node version:
node --version
echo NPM version:
npm --version
echo ESLint version:
eslint --version 2>nul
echo TypeScript version:
tsc --version 2>nul
echo Vite version:
vite --version 2>nul
echo.

echo 11. Testing basic functionality...
echo Testing npm list...
npm list --depth=0 2>nul
echo Testing ESLint...
npx eslint --version 2>nul
echo Testing TypeScript...
npx tsc --version 2>nul
echo Testing Vite...
npx vite --version 2>nul
echo.

echo 12. Creating optimized scripts...
echo Creating simple batch scripts...

echo @echo off > start-simple.bat
echo echo Starting development server... >> start-simple.bat
echo npm run dev >> start-simple.bat

echo @echo off > build-simple.bat
echo echo Building project... >> build-simple.bat
echo npm run build >> build-simple.bat

echo @echo off > lint-simple.bat
echo echo Running ESLint... >> lint-simple.bat
echo npx eslint src --ext .ts,.tsx >> lint-simple.bat

echo Created optimized batch scripts
echo.

echo 13. Final system check...
echo Checking for common issues...

if exist package.json (
    echo ✓ package.json exists
) else (
    echo ✗ package.json not found
)

if exist node_modules (
    echo ✓ node_modules directory exists
) else (
    echo ✗ node_modules directory missing
)

if exist node_modules\react (
    echo ✓ react is installed
) else (
    echo ✗ react is missing
)

if exist node_modules\vite (
    echo ✓ vite is installed
) else (
    echo ✗ vite is missing
)

if exist node_modules\typescript (
    echo ✓ typescript is installed
) else (
    echo ✗ typescript is missing
)

if exist node_modules\eslint (
    echo ✓ eslint is installed
) else (
    echo ✗ eslint is missing
)

echo.
echo ========================================
echo COMPREHENSIVE SYSTEM FIX COMPLETED
echo ========================================
echo Timestamp: %date% %time%
echo.
echo Next steps:
echo 1. Try running: npm run dev
echo 2. If issues persist, check npm-install.log for errors
echo 3. Try the simple batch scripts created
echo 4. Restart Cursor IDE if needed
echo.
pause 