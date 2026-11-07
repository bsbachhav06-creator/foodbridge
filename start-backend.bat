@echo off
title FoodBridge Backend (Spring Boot 3.3.5)
echo ========================================================
echo   Starting FoodBridge Backend (Spring Boot 3.3.5)
echo   API URL:       http://localhost:8080
echo   Swagger UI:    http://localhost:8080/swagger-ui.html
echo   H2 DB Console: http://localhost:8080/h2-console
echo ========================================================
echo.

cd /d "%~dp0backend"

if exist "target\foodbridge-backend-1.0.0.jar" (
    echo Launching pre-built production JAR...
    java -jar target\foodbridge-backend-1.0.0.jar
) else (
    echo Pre-built JAR not found. Launching via Maven...
    call mvnw.cmd spring-boot:run
)

pause
