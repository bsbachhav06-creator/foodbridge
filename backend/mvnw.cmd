@echo off
setlocal
where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn %*
) else (
    if exist "C:\Users\Bhagyesh\.antigravity-ide\extensions\oracle.oracle-java-26.0.2-universal\nbcode\java\maven\bin\mvn.cmd" (
        "C:\Users\Bhagyesh\.antigravity-ide\extensions\oracle.oracle-java-26.0.2-universal\nbcode\java\maven\bin\mvn.cmd" %*
    ) else (
        echo [ERROR] Maven not found on PATH.
        echo Please ensure Maven is installed or use 'java -jar target\foodbridge-backend-1.0.0.jar' to run the packaged application.
        exit /b 1
    )
)
