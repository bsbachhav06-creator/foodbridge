@echo off
title FoodBridge Frontend (React + Vite)
echo ========================================================
echo   Starting FoodBridge Frontend (React 18 + Vite 5)
echo   Web App URL: http://localhost:5173
echo ========================================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing npm dependencies first...
    call npm.cmd install
)

echo Launching Vite development server...
call npm.cmd run dev

pause
