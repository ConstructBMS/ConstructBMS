# ConstructBMS - Complete Restart & Rebuild Script
# PowerShell version with enhanced error handling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ConstructBMS - Complete Restart & Rebuild" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Function to wait for port to be available
function Wait-ForPort {
    param($Port, $Timeout = 30)
    $startTime = Get-Date
    while ((Get-Date) -lt $startTime.AddSeconds($Timeout)) {
        if (-not (Test-Port $Port)) {
            return $true
        }
        Start-Sleep -Seconds 1
    }
    return $false
}

try {
    # Step 1: Stop all Node.js processes
    Write-Host "[1/7] Stopping all Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "✓ Stopped $($nodeProcesses.Count) Node.js processes" -ForegroundColor Green
    } else {
        Write-Host "✓ No Node.js processes found" -ForegroundColor Green
    }
    
    # Wait for processes to fully terminate
    Start-Sleep -Seconds 3
    
    # Step 2: Clean build artifacts
    Write-Host ""
    Write-Host "[2/7] Cleaning build artifacts..." -ForegroundColor Yellow
    $pathsToClean = @("dist", "node_modules\.vite")
    foreach ($path in $pathsToClean) {
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✓ Cleaned $path" -ForegroundColor Green
        }
    }
    
    # Step 3: Reinstall dependencies
    Write-Host ""
    Write-Host "[3/7] Reinstalling dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    
    # Step 4: Wait for ports to be available
    Write-Host ""
    Write-Host "[4/7] Checking port availability..." -ForegroundColor Yellow
    $ports = @(5173, 3001)
    foreach ($port in $ports) {
        if (Test-Port $port) {
            Write-Host "⚠ Port $port is still in use, waiting..." -ForegroundColor Yellow
            if (-not (Wait-ForPort $port)) {
                throw "Port $port is still in use after timeout"
            }
        }
    }
    Write-Host "✓ All ports available" -ForegroundColor Green
    
    # Step 5: Start backend server in background
    Write-Host ""
    Write-Host "[5/7] Starting backend server..." -ForegroundColor Yellow
    Start-Job -ScriptBlock { Set-Location $using:PWD; npm run server } -Name "BackendServer"
    Start-Sleep -Seconds 5
    
    # Step 6: Verify backend is running
    Write-Host ""
    Write-Host "[6/7] Verifying backend server..." -ForegroundColor Yellow
    $retries = 0
    $maxRetries = 10
    while ($retries -lt $maxRetries) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ Backend server is running" -ForegroundColor Green
                break
            }
        } catch {
            $retries++
            if ($retries -eq $maxRetries) {
                throw "Backend server failed to start"
            }
            Start-Sleep -Seconds 2
        }
    }
    
    # Step 7: Start frontend server in background
    Write-Host ""
    Write-Host "[7/7] Starting frontend server..." -ForegroundColor Yellow
    Start-Job -ScriptBlock { Set-Location $using:PWD; npm run dev } -Name "FrontendServer"
    Start-Sleep -Seconds 3
    
    # Final status
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✓ Restart complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "Backend:  http://localhost:3001" -ForegroundColor White
    Write-Host ""
    Write-Host "Background jobs started:" -ForegroundColor Yellow
    Get-Job | Format-Table -AutoSize
    Write-Host ""
    Write-Host "To view server logs, use:" -ForegroundColor Yellow
    Write-Host "  Receive-Job -Name 'BackendServer'" -ForegroundColor Gray
    Write-Host "  Receive-Job -Name 'FrontendServer'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opening application in browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5173"
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Error during restart process" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
} 