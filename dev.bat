@echo off
REM Archer Project Quick Commands
REM Usage: dev [command]

if "%1"=="" (
    echo Archer Project Quick Commands
    echo ===========================
    echo.
    echo Available commands:
    echo   start     - Start development server
    echo   tunnel    - Start dev server + ngrok tunnel
    echo   kill      - Kill all Node.js processes
    echo   restart   - Kill processes and restart dev server
    echo   clean     - Clean build artifacts
    echo   install   - Install dependencies
    echo   build     - Build for production
    echo   lint      - Run ESLint
    echo   typecheck - Run TypeScript type checking
    echo.
    echo Examples:
    echo   dev start
    echo   dev tunnel
    echo   dev restart
    goto :eof
)

if "%1"=="start" (
    echo Starting development server...
    npm run dev
    goto :eof
)

if "%1"=="tunnel" (
    echo Starting development server with ngrok tunnel...
    npm run dev:tunnel
    goto :eof
)

if "%1"=="kill" (
    echo Stopping all Node.js processes...
    npm run kill
    goto :eof
)

if "%1"=="restart" (
    echo Restarting development server...
    npm run kill
    timeout /t 2 /nobreak >nul
    npm run dev
    goto :eof
)

if "%1"=="clean" (
    echo Cleaning build artifacts...
    npm run clean
    goto :eof
)

if "%1"=="install" (
    echo Installing dependencies...
    npm install
    goto :eof
)

if "%1"=="build" (
    echo Building for production...
    npm run build
    goto :eof
)

if "%1"=="lint" (
    echo Running ESLint...
    npm run lint
    goto :eof
)

if "%1"=="typecheck" (
    echo Running TypeScript type checking...
    npm run type-check
    goto :eof
)

echo Unknown command: %1
echo Run 'dev' without arguments to see available commands. 