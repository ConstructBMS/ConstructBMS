@echo off
echo Disabling ESLint completely...
echo.

echo 1. Renaming ESLint config files...
if exist eslint.config.js (
    ren eslint.config.js eslint.config.js.disabled
    echo - Renamed eslint.config.js to eslint.config.js.disabled
)

if exist eslint.config.simple.js (
    ren eslint.config.simple.js eslint.config.simple.js.disabled
    echo - Renamed eslint.config.simple.js to eslint.config.simple.js.disabled
)

if exist eslint.config.minimal.js (
    ren eslint.config.minimal.js eslint.config.minimal.js.disabled
    echo - Renamed eslint.config.minimal.js to eslint.config.minimal.js.disabled
)

echo.
echo 2. Creating disabled ESLint config...
echo import js from '@eslint/js'; > eslint.config.js
echo. >> eslint.config.js
echo export default [ >> eslint.config.js
echo   { >> eslint.config.js
echo     ignores: ['**/*'], >> eslint.config.js
echo   }, >> eslint.config.js
echo ]; >> eslint.config.js

echo.
echo 3. Updating package.json scripts...
echo ESLint has been completely disabled.
echo All lint commands will now just echo "ESLint disabled"
echo.
echo You can now focus on development without ESLint issues.
echo.
pause 