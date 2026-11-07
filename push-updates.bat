@echo off
setlocal
cd /d "%~dp0"
title FoodBridge - Push Updates to GitHub
echo ========================================================
echo   Pushing Latest FoodBridge Changes to GitHub
echo   Repository: bsbachhav06-creator/foodbridge (main)
echo ========================================================
echo.

set /p commit_msg="Enter a description of what you changed (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update FoodBridge application

echo.
echo Adding and committing changes...
git add .
git commit -m "%commit_msg%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================================
echo [SUCCESS] Your GitHub repository is updated!
echo.
echo Render (and Vercel) automatically detect this push,
echo and will rebuild and re-deploy your live site
echo within 1-2 minutes!
echo ========================================================
pause
