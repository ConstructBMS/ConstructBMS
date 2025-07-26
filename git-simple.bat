@echo off
echo Running git command: %*
git %*
if %ERRORLEVEL% NEQ 0 (
    echo Git command failed with error code: %ERRORLEVEL%
    pause
) 