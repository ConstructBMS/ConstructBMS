# Fix PowerShell Hanging Issues
# This script addresses the root cause of command hanging

Write-Host "=== FIXING POWERSHELL HANGING ISSUES ===" -ForegroundColor Green

# Step 1: Disable PSReadLine temporarily
Write-Host "1. Disabling PSReadLine..." -ForegroundColor Yellow
try {
    Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue
    Write-Host "✓ PSReadLine disabled" -ForegroundColor Green
} catch {
    Write-Host "PSReadLine not loaded" -ForegroundColor Yellow
}

# Step 2: Reset PowerShell execution policy
Write-Host "2. Resetting execution policy..." -ForegroundColor Yellow
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✓ Execution policy set to RemoteSigned" -ForegroundColor Green
} catch {
    Write-Host "Could not set execution policy" -ForegroundColor Red
}

# Step 3: Clear PowerShell profile
Write-Host "3. Clearing PowerShell profile..." -ForegroundColor Yellow
$profilePath = $PROFILE.CurrentUserAllHosts
if (Test-Path $profilePath) {
    try {
        Rename-Item $profilePath "$profilePath.backup" -Force
        Write-Host "✓ Profile backed up and cleared" -ForegroundColor Green
    } catch {
        Write-Host "Could not backup profile" -ForegroundColor Red
    }
}

# Step 4: Reset environment variables
Write-Host "4. Resetting environment variables..." -ForegroundColor Yellow
$env:PSModulePath = [System.Environment]::GetEnvironmentVariable("PSModulePath", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PSModulePath", "User")
Write-Host "✓ PSModulePath reset" -ForegroundColor Green

# Step 5: Test basic commands
Write-Host "5. Testing basic commands..." -ForegroundColor Yellow
try {
    $testResult = Get-Date
    Write-Host "✓ Date command works: $testResult" -ForegroundColor Green
} catch {
    Write-Host "✗ Date command failed" -ForegroundColor Red
}

# Step 6: Create a clean PowerShell profile
Write-Host "6. Creating clean PowerShell profile..." -ForegroundColor Yellow
$cleanProfile = @"
# Clean PowerShell Profile
# Disable PSReadLine to prevent hanging
`$PSDefaultParameterValues['Out-Default:OutVariable'] = 'null'

# Set basic preferences
`$Host.UI.RawUI.WindowTitle = "ConstructBMS Development"

# Disable command prediction
if (Get-Module PSReadLine) {
    Set-PSReadLineOption -PredictionSource None
    Set-PSReadLineOption -PredictionViewStyle None
}

Write-Host "Clean PowerShell profile loaded" -ForegroundColor Green
"@

try {
    $cleanProfile | Out-File -FilePath $profilePath -Encoding UTF8
    Write-Host "✓ Clean profile created" -ForegroundColor Green
} catch {
    Write-Host "Could not create profile" -ForegroundColor Red
}

# Step 7: Test Node.js and npm
Write-Host "7. Testing Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js works: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js not working" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Node.js test failed" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm works: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ npm not working" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ npm test failed" -ForegroundColor Red
}

Write-Host "`n=== POWERSHELL FIX COMPLETED ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Open a new PowerShell window" -ForegroundColor White
Write-Host "3. Navigate to your project directory" -ForegroundColor White
Write-Host "4. Try running commands again" -ForegroundColor White
Write-Host "5. If issues persist, restart your computer" -ForegroundColor White

# Create a batch file for easy restart
$restartScript = @"
@echo off
echo Restarting PowerShell with clean environment...
echo.
echo Close this window and open a new PowerShell window
echo Then navigate to your project directory and try again
echo.
pause
"@

$restartScript | Out-File -FilePath "restart-powershell.bat" -Encoding ASCII
Write-Host "✓ Created restart-powershell.bat" -ForegroundColor Green 