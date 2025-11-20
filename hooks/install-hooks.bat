@echo off
REM Setup script for Git hooks on Windows

echo Installing Git hooks...

REM Check if .git directory exists
if not exist ".git" (
    echo Error: Not in a git repository root directory
    exit /b 1
)

REM Copy the commit-msg hook
if exist "hooks\commit-msg" (
    copy /Y "hooks\commit-msg" ".git\hooks\commit-msg"
    echo ✅ commit-msg hook installed
) else (
    echo ❌ Error: hooks\commit-msg not found
    exit /b 1
)

echo.
echo ✅ Git hooks installed successfully!
echo.
echo All commits must now follow Conventional Commits format:
echo   ^<type^>[optional scope]: ^<description^>
echo.
echo Example: feat: add new authentication feature
