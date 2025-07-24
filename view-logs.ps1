# View server logs in current terminal
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ConstructBMS - Server Logs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if background jobs exist
$backendJob = Get-Job -Name "BackendServer" -ErrorAction SilentlyContinue
$frontendJob = Get-Job -Name "FrontendServer" -ErrorAction SilentlyContinue

if ($backendJob -or $frontendJob) {
    Write-Host "Background jobs found:" -ForegroundColor Green
    Get-Job | Format-Table -AutoSize
    
    Write-Host ""
    Write-Host "To view logs, choose an option:" -ForegroundColor Yellow
    Write-Host "1. Backend server logs" -ForegroundColor White
    Write-Host "2. Frontend server logs" -ForegroundColor White
    Write-Host "3. Both servers (real-time)" -ForegroundColor White
    Write-Host "4. Exit" -ForegroundColor White
    
    $choice = Read-Host "`nEnter your choice (1-4)"
    
    switch ($choice) {
        "1" {
            if ($backendJob) {
                Write-Host "`n=== Backend Server Logs ===" -ForegroundColor Green
                Receive-Job -Name "BackendServer" -Keep
            } else {
                Write-Host "Backend server job not found" -ForegroundColor Red
            }
        }
        "2" {
            if ($frontendJob) {
                Write-Host "`n=== Frontend Server Logs ===" -ForegroundColor Green
                Receive-Job -Name "FrontendServer" -Keep
            } else {
                Write-Host "Frontend server job not found" -ForegroundColor Red
            }
        }
        "3" {
            Write-Host "`n=== Real-time Server Logs ===" -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
            try {
                while ($true) {
                    if ($backendJob) {
                        $backendLogs = Receive-Job -Name "BackendServer" -Keep
                        if ($backendLogs) {
                            Write-Host "[BACKEND] $backendLogs" -ForegroundColor Blue
                        }
                    }
                    if ($frontendJob) {
                        $frontendLogs = Receive-Job -Name "FrontendServer" -Keep
                        if ($frontendLogs) {
                            Write-Host "[FRONTEND] $frontendLogs" -ForegroundColor Green
                        }
                    }
                    Start-Sleep -Milliseconds 100
                }
            } catch {
                Write-Host "`nMonitoring stopped" -ForegroundColor Yellow
            }
        }
        "4" {
            Write-Host "Exiting..." -ForegroundColor Yellow
        }
        default {
            Write-Host "Invalid choice" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No background jobs found." -ForegroundColor Yellow
    Write-Host "Make sure to run the restart script first." -ForegroundColor Yellow
} 