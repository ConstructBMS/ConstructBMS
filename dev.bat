@echo off
setlocal enabledelayedexpansion

REM ConstructBMS Development Script
REM Usage: dev [command]

if "%1"=="" (
    echo ConstructBMS Development Commands
    echo ================================
    echo.
    echo Available commands:
    echo   start     - Start development server only
    echo   full      - Start both frontend and backend servers
    echo   kill      - Kill all Node.js processes
    echo   restart   - Kill processes and restart dev server
    echo   clean     - Clean build artifacts and node_modules
    echo   install   - Install dependencies
    echo   build     - Build for production
    echo   lint      - Run ESLint
    echo   typecheck - Run TypeScript type checking
    echo.
    echo Examples:
    echo   dev start
    echo   dev full
    echo   dev restart
    goto :eof
)

REM Function to kill Node processes
:kill_processes
echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ Processes stopped
goto :eof

if "%1"=="start" (
    echo Starting development server...
    npm run dev
    goto :eof
)

if "%1"=="full" (
    echo Starting full development environment...
    echo.
    call :kill_processes
    echo.
    echo Starting backend server...
    start /b cmd /c "npm run server"
    timeout /t 3 /nobreak >nul
    echo ✓ Backend started on port 3001
    echo.
    echo Starting frontend server...
    start /b cmd /c "npm run dev"
    timeout /t 3 /nobreak >nul
    echo ✓ Frontend started on port 5173
    echo.
    echo Opening browser...
    timeout /t 2 /nobreak >nul
    start http://localhost:5173
    echo ✓ Browser opened
    echo.
    echo 🎉 Development environment ready!
    echo Frontend: http://localhost:5173
    echo Backend:  http://localhost:3001/api/health
    echo.
    echo Servers are running in background. Use 'dev kill' to stop them.
    goto :eof
)

if "%1"=="kill" (
    call :kill_processes
    goto :eof
)

if "%1"=="restart" (
    echo Restarting development server...
    call :kill_processes
    echo.
    echo Starting development server...
    npm run dev
    goto :eof
)

if "%1"=="clean" (
    echo Cleaning build artifacts...
    if exist "dist" rmdir /s /q "dist"
    if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
    if exist ".vite" rmdir /s /q ".vite"
    echo ✓ Cleaned build artifacts
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