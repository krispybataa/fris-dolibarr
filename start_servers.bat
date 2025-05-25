@echo off
echo Starting FRIS Application Servers...

:: Start the backend server
echo Starting FastAPI Backend Server...
start cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
timeout /t 5

:: Start the frontend server
echo Starting React Frontend Server...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo FRIS Application Servers are running:
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:5173
echo.
echo To stop all servers, run stop_servers.bat
echo.
