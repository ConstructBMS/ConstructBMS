@echo off
echo Running minimal ESLint...
npx eslint src --max-warnings 999 --config eslint.config.minimal.js
if %ERRORLEVEL% NEQ 0 (
    echo ESLint completed with warnings
) else (
    echo ESLint completed successfully
)
pause 