@echo off
title Baby Tracker - Full Stack Application
echo.
echo ========================================
echo   Baby Tracker - Starting Application
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo.
echo Starting Backend Server (Flask on port 5000)...
echo.
start cmd /k "cd backend && python app.py"

timeout /t 3

echo.
echo Starting Frontend Development Server (React on port 3000)...
echo.
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Application is starting up...
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
pause
