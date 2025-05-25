@echo off
echo Stopping FRIS Application Servers...

:: Kill all Node.js processes (frontend)
echo Stopping Frontend Server...
taskkill /F /IM node.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Frontend server stopped successfully.
) else (
    echo No frontend server processes found.
)

:: Kill all Python processes (backend)
echo Stopping Backend Server...
taskkill /F /IM python.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Backend server stopped successfully.
) else (
    echo No backend server processes found.
)

echo.
echo All FRIS Application Servers have been stopped.
echo.
pause
