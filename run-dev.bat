@echo off
echo Starting AquaMap Development Servers...
echo.

REM Check if virtual environment exists
if not exist "backend\venv" (
    echo Backend virtual environment not found. Creating...
    cd backend
    python -m venv venv
    echo Installing backend dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    cd ..
)

echo Starting backend server...
start "AquaMap Backend" cmd /k "cd backend && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && python main.py"

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

echo Starting frontend server...
start "AquaMap Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the windows to stop the servers.
pause
