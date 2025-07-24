# ConstructBMS Cursor Setup Script (PowerShell)
# This script automatically starts both frontend and backend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ConstructBMS Cursor Auto-Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host

# Kill any existing Node processes
Write-Host "Stopping any existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start both servers using concurrently
Write-Host "Starting development servers..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001/api/health" -ForegroundColor Green
Write-Host

npm run dev:concurrent 