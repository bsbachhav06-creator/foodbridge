@echo off
setlocal
cd /d "%~dp0"
title FoodBridge Public Cloudflare Tunnel
echo ========================================================
echo   Launching FoodBridge Public Live Tunnel
echo ========================================================
echo.

if not exist "cloudflared.exe" (
    echo Downloading cloudflared.exe...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe' -UseBasicParsing"
)

echo Starting Backend and Frontend if not already running...
start "FoodBridge Backend" start-backend.bat
timeout /t 3 /nobreak >nul
start "FoodBridge Frontend" start-frontend.bat
timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo Creating secure public HTTPS tunnel for FoodBridge...
echo Watch below for your public URL ending in .trycloudflare.com!
echo ========================================================
echo.

cloudflared.exe tunnel --url http://localhost:5173

pause
