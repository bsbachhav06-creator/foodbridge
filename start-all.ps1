# FoodBridge Full-Stack Startup Script for PowerShell
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Launching FoodBridge Full-Stack Application" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Spring Boot Backend on http://localhost:8080..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$scriptDir\start-backend.bat`""

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting React Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$scriptDir\start-frontend.bat`""

Write-Host ""
Write-Host "Both services are launching in dedicated windows!" -ForegroundColor Yellow
Write-Host "Backend API:  http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui.html)" -ForegroundColor Yellow
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Yellow
