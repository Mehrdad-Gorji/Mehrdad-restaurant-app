@echo off
cd /d "%~dp0"
title Auto Printer Service
echo.
echo ========================================================
echo   Auto Printer Service is Starting...
echo ========================================================
echo.
echo   1. Starting Node.js Server...
echo   2. Opening Dashboard in Browser...
echo.

:: Open Browser (Wait 2 seconds for server to boot)
timeout /t 2 /nobreak >nul
start "" "http://localhost:4000"

:: Run Server
echo Starting Server...
node server.js
pause
