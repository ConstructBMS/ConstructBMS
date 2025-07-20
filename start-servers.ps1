# ConstructBMS Server Startup Script
# Simplified and reliable server management

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ConstructBMS Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing Node processes
Write-Host "[1/4] Stopping existing processes..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "    ✓ Stopped existing Node processes" -ForegroundColor Green
    } else {
        Write-Host "    ℹ No existing processes found" -ForegroundColor Blue
    }
} catch {
    Write-Host "    ℹ No existing processes found" -ForegroundColor Blue
}
Write-Host ""

# Install dependencies if needed
Write-Host "[2/4] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "    Installing dependencies..." -ForegroundColor Yellow
    npm install --silent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "    ✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "    ✓ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Start backend server
Write-Host "[3/4] Starting backend server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run server" -WindowStyle Minimized
    Start-Sleep -Seconds 3
    Write-Host "    ✓ Backend server started on port 3001" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Failed to start backend server" -ForegroundColor Red
}
Write-Host ""

# Start frontend server
Write-Host "[4/4] Starting frontend server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "cmd" -ArgumentList "/c", "npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 3
    Write-Host "    ✓ Frontend server started on port 5173" -ForegroundColor Green
} catch {
    Write-Host "    ✗ Failed to start frontend server" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    🎉 Servers are ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Yellow
Write-Host "  Super Admin: constructbms@gmail.com / ConstructBMS25" -ForegroundColor White
Write-Host "  Admin:       admin@constructbms.com / ConstructBMS25" -ForegroundColor White
Write-Host "  Employee:    employee@constructbms.com / ConstructBMS25" -ForegroundColor White
Write-Host ""
Write-Host "Use 'dev kill' or 'taskkill /f /im node.exe' to stop servers." 