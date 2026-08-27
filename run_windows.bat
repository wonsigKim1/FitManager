@echo off
echo ===================================================
echo   FitManager Web App Server Starting...
echo ===================================================
echo.
echo Browser will open automatically at http://localhost:8080
start http://localhost:8080
python -m http.server 8080
pause
