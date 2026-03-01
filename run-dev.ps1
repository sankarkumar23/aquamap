# PowerShell script to run both backend and frontend
Write-Host "Starting AquaMap Development Servers..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "Backend virtual environment not found. Creating..." -ForegroundColor Yellow
    Set-Location backend
    python -m venv venv
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    Set-Location ..
}

# Check if frontend node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path venv\Scripts\Activate.ps1) { .\venv\Scripts\Activate.ps1 }; python main.py"

# Wait a moment for backend to start
Start-Sleep -Seconds 2

Write-Host "Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers (close the windows manually)." -ForegroundColor Gray
