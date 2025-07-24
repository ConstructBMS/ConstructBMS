# ConstructBMS - Automated Restart & Rebuild Script (PowerShell)
# Handles all npm prompts automatically and fixes common startup issues

param(
    [switch]$SkipBrowser,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for console output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Red" = "Red"
        "Green" = "Green" 
        "Yellow" = "Yellow"
        "Blue" = "Blue"
        "Magenta" = "Magenta"
        "Cyan" = "Cyan"
        "White" = "White"
    }
    
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Write-Step {
    param([int]$Step, [int]$Total, [string]$Message)
    Write-ColorOutput "[$Step/$Total] $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Blue"
}

# Function to kill Node.js processes
function Stop-NodeProcesses {
    Write-Step 1 8 "Stopping all Node.js processes..."
    
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            $nodeProcesses | Stop-Process -Force
            Write-Success "Stopped $($nodeProcesses.Count) Node.js processes"
        } else {
            Write-Success "No Node.js processes found"
        }
    } catch {
        Write-Warning "No Node.js processes found or already stopped"
    }
    
    # Wait for processes to fully terminate
    Write-Info "Waiting for processes to terminate..."
    Start-Sleep -Seconds 3
}

# Function to clean build artifacts
function Remove-BuildArtifacts {
    Write-Step 2 8 "Cleaning build artifacts..."
    
    $pathsToClean = @("dist", "node_modules\.vite", "node_modules\.cache")
    
    foreach ($path in $pathsToClean) {
        if (Test-Path $path) {
            try {
                Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
                Write-Success "Cleaned $path"
            } catch {
                Write-Warning "Could not clean $path`: $($_.Exception.Message)"
            }
        }
    }
}

# Function to fix package-lock.json
function Remove-PackageLock {
    Write-Step 3 8 "Checking package-lock.json integrity..."
    
    if (Test-Path "package-lock.json") {
        try {
            Remove-Item "package-lock.json" -Force
            Write-Success "Removed package-lock.json for fresh install"
        } catch {
            Write-Warning "Could not remove package-lock.json`: $($_.Exception.Message)"
        }
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Step 4 8 "Installing dependencies..."
    
    try {
        # Use npm install with automatic yes
        npm install --yes
        Write-Success "Dependencies installed successfully"
    } catch {
        Write-Error "Failed to install dependencies"
        throw
    }
}

# Function to fix linting issues
function Fix-LintingIssues {
    Write-Step 5 8 "Fixing linting issues..."
    
    try {
        npm run lint:fix
        Write-Success "Linting issues fixed"
    } catch {
        Write-Warning "Some linting issues could not be auto-fixed"
    }
}

# Function to run type check
function Test-TypeCheck {
    Write-Step 6 8 "Running type check..."
    
    try {
        npm run type-check
        Write-Success "Type check passed"
    } catch {
        Write-Error "Type check failed"
        throw
    }
}

# Function to start servers
function Start-Servers {
    Write-Step 7 8 "Starting servers..."
    
    try {
        # Start backend server in background
        Write-Info "Starting backend server..."
        $backendJob = Start-Job -ScriptBlock { 
            Set-Location $using:PWD
            npm run server 
        } -Name "BackendServer"
        
        # Wait for backend to start
        Write-Info "Waiting for backend to initialize..."
        Start-Sleep -Seconds 5
        
        # Start frontend server in background
        Write-Info "Starting frontend server..."
        $frontendJob = Start-Job -ScriptBlock { 
            Set-Location $using:PWD
            npm run dev 
        } -Name "FrontendServer"
        
        # Wait for frontend to start
        Write-Info "Waiting for frontend to initialize..."
        Start-Sleep -Seconds 3
        
        Write-Success "Servers started in background"
        
        # Store job information
        $jobs = @{
            Backend = $backendJob.Id
            Frontend = $frontendJob.Id
        }
        $jobs | ConvertTo-Json | Set-Content ".process-ids"
        
    } catch {
        Write-Error "Failed to start servers"
        throw
    }
}

# Function to verify servers
function Test-Servers {
    Write-Step 8 8 "Verifying servers..."
    
    try {
        # Check if servers are responding
        $backendReady = $false
        $frontendReady = $false
        $attempts = 0
        $maxAttempts = 10
        
        while ($attempts -lt $maxAttempts -and (-not $backendReady -or -not $frontendReady)) {
            $attempts++
            Write-Info "Verification attempt $attempts/$maxAttempts..."
            
            if (-not $backendReady) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 5 -ErrorAction Stop
                    if ($response.StatusCode -eq 200) {
                        $backendReady = $true
                        Write-Success "Backend server is running"
                    }
                } catch {
                    # Backend not ready yet
                }
            }
            
            if (-not $frontendReady) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
                    if ($response.StatusCode -eq 200) {
                        $frontendReady = $true
                        Write-Success "Frontend server is running"
                    }
                } catch {
                    # Frontend not ready yet
                }
            }
            
            if (-not $backendReady -or -not $frontendReady) {
                Start-Sleep -Seconds 2
            }
        }
        
        if ($backendReady -and $frontendReady) {
            Write-Success "All servers verified and running"
        } else {
            throw "Server verification failed"
        }
        
    } catch {
        Write-Error "Server verification failed"
        throw
    }
}

# Function to open browser
function Open-Browser {
    if (-not $SkipBrowser) {
        Write-Info "Opening application in browser..."
        
        try {
            Start-Process "http://localhost:5173"
            Write-Success "Browser opened"
        } catch {
            Write-Warning "Could not open browser automatically"
        }
    }
}

# Function to show final status
function Show-FinalStatus {
    Write-Host ""
    Write-ColorOutput ("=" * 50) "Cyan"
    Write-ColorOutput "✓ RESTART AND REBUILD COMPLETE!" "Green"
    Write-ColorOutput ("=" * 50) "Cyan"
    Write-Host ""
    Write-ColorOutput "Frontend: http://localhost:5173" "White"
    Write-ColorOutput "Backend:  http://localhost:3001" "White"
    Write-Host ""
    Write-ColorOutput "Servers are running in background." "Yellow"
    Write-ColorOutput "To stop servers, run: npm run kill" "Yellow"
    Write-ColorOutput "To view logs, check the job output." "Yellow"
    Write-Host ""
    Write-ColorOutput "Happy coding! 🚀" "Magenta"
}

# Main execution
try {
    Write-ColorOutput ("=" * 50) "Cyan"
    Write-ColorOutput "ConstructBMS - Automated Restart & Rebuild" "Cyan"
    Write-ColorOutput ("=" * 50) "Cyan"
    Write-Host ""
    
    # Execute all steps
    Stop-NodeProcesses
    Remove-BuildArtifacts
    Remove-PackageLock
    Install-Dependencies
    Fix-LintingIssues
    Test-TypeCheck
    Start-Servers
    Test-Servers
    
    # Final steps
    Open-Browser
    Show-FinalStatus
    
} catch {
    Write-Error "Restart failed: $($_.Exception.Message)"
    Write-Host ""
    Write-ColorOutput "Troubleshooting tips:" "Yellow"
    Write-ColorOutput "1. Check if ports 5173 and 3001 are available" "Yellow"
    Write-ColorOutput "2. Ensure you have Node.js 18+ installed" "Yellow"
    Write-ColorOutput "3. Try running: npm run kill && npm install" "Yellow"
    Write-ColorOutput "4. Check the error logs above for specific issues" "Yellow"
    Write-Host ""
    exit 1
} 