@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo   Launching FoodBridge Full-Stack Application
echo ========================================================
echo.
echo Starting Backend in a separate window...
start "FoodBridge Backend" start-backend.bat

timeout /t 3 /nobreak >nul

echo Starting Frontend in a separate window...
start "FoodBridge Frontend" start-frontend.bat

echo.
echo ========================================================
echo Both services are starting up!
echo   - Web Application: http://localhost:5173
echo   - Backend API:     http://localhost:8080
echo   - Swagger Docs:    http://localhost:8080/swagger-ui.html
echo ========================================================
echo You can close this launcher window.
timeout /t 5
