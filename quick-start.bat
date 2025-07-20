@echo off
echo ========================================
echo    ConstructBMS Quick Start
echo ========================================
echo.

echo Choose an option:
echo 1. Start development server only
echo 2. Start full environment (frontend + backend)
echo 3. Kill all processes
echo 4. Restart development server
echo 5. Clean and reinstall
echo 6. Run linting
echo 7. Type check
echo 8. Build for production
echo 9. Exit
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" (
    echo Starting development server...
    npm run dev
) else if "%choice%"=="2" (
    echo Starting full environment...
    dev full
) else if "%choice%"=="3" (
    echo Killing all processes...
    dev kill
    echo Done.
    pause
) else if "%choice%"=="4" (
    echo Restarting development server...
    dev restart
) else if "%choice%"=="5" (
    echo Cleaning and reinstalling...
    dev clean
    npm install
    echo Done.
    pause
) else if "%choice%"=="6" (
    echo Running linting...
    npm run lint
    pause
) else if "%choice%"=="7" (
    echo Running type check...
    npm run type-check
    pause
) else if "%choice%"=="8" (
    echo Building for production...
    npm run build
    pause
) else if "%choice%"=="9" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please try again.
    pause
    call quick-start.bat
) 