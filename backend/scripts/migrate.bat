@echo off
echo.
echo ========================================
echo   Afisha.kz Database Migration Script
echo ========================================
echo.

if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL is not set!
    echo.
    echo Please set DATABASE_URL first:
    echo   set DATABASE_URL=postgresql://user:password@host/database
    echo.
    echo Get the URL from Railway Dashboard - Variables
    echo.
    pause
    exit /b 1
)

echo DATABASE_URL is set. Running migration...
echo.

cd /d "%~dp0.."
npx drizzle-kit push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Migration completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   Migration FAILED!
    echo ========================================
)

echo.
pause
