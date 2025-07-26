# Advanced System Fix Script for ConstructBMS
# This script handles hanging issues and performs comprehensive fixes

Write-Host "=== ADVANCED SYSTEM FIX STARTING ===" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow

# Function to safely run commands with timeout
function Invoke-CommandWithTimeout {
    param(
        [string]$Command,
        [int]$TimeoutSeconds = 30,
        [string]$Description = ""
    )
    
    Write-Host "Running: $Description" -ForegroundColor Cyan
    
    try {
        $job = Start-Job -ScriptBlock { param($cmd) Invoke-Expression $cmd } -ArgumentList $Command
        
        if (Wait-Job $job -Timeout $TimeoutSeconds) {
            $result = Receive-Job $job
            Remove-Job $job
            Write-Host "✓ Completed: $Description" -ForegroundColor Green
            return $result
        } else {
            Remove-Job $job -Force
            Write-Host "✗ Timeout: $Description" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "✗ Error: $Description - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step 1: Kill all hanging processes
Write-Host "`n1. Killing hanging processes..." -ForegroundColor Cyan
$processes = @("node", "npm", "vite", "eslint", "typescript", "tailwind")
foreach ($proc in $processes) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Killed $proc processes" -ForegroundColor Yellow
}

# Step 2: Clear caches safely
Write-Host "`n2. Clearing caches..." -ForegroundColor Cyan

# Remove node_modules with timeout
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Invoke-CommandWithTimeout -Command "Remove-Item -Recurse -Force 'node_modules'" -TimeoutSeconds 60 -Description "Remove node_modules"
}

# Remove package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
}

# Clear npm cache with timeout
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
Invoke-CommandWithTimeout -Command "npm cache clean --force" -TimeoutSeconds 30 -Description "Clear npm cache"

# Step 3: Fix npm configuration
Write-Host "`n3. Fixing npm configuration..." -ForegroundColor Cyan
Invoke-CommandWithTimeout -Command "npm config set registry https://registry.npmjs.org/" -TimeoutSeconds 10 -Description "Set npm registry"
Invoke-CommandWithTimeout -Command "npm config set fetch-retries 3" -TimeoutSeconds 10 -Description "Set fetch retries"
Invoke-CommandWithTimeout -Command "npm config set fetch-retry-mintimeout 5000" -TimeoutSeconds 10 -Description "Set min timeout"
Invoke-CommandWithTimeout -Command "npm config set fetch-retry-maxtimeout 60000" -TimeoutSeconds 10 -Description "Set max timeout"

# Step 4: Install dependencies with progress monitoring
Write-Host "`n4. Installing dependencies..." -ForegroundColor Cyan
Write-Host "This may take several minutes..." -ForegroundColor Yellow

# Create a monitoring job for npm install
$installJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm install --no-optional --progress=false
}

# Monitor the job with timeout
$timeout = 600  # 10 minutes
$startTime = Get-Date
$completed = $false

while (-not $completed -and ((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
    if ($installJob.State -eq "Completed") {
        $completed = $true
        $result = Receive-Job $installJob
        Remove-Job $installJob
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } elseif ($installJob.State -eq "Failed") {
        $completed = $true
        $error = Receive-Job $installJob -ErrorAction SilentlyContinue
        Remove-Job $installJob
        Write-Host "✗ Dependency installation failed" -ForegroundColor Red
        Write-Host $error -ForegroundColor Red
    } else {
        Write-Host "Installing dependencies... (waiting)" -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
}

if (-not $completed) {
    Remove-Job $installJob -Force
    Write-Host "✗ Dependency installation timed out" -ForegroundColor Red
}

# Step 5: Install key tools individually
Write-Host "`n5. Installing key tools..." -ForegroundColor Cyan

$tools = @(
    @{Name="ESLint"; Command="npm install --save-dev eslint@latest"},
    @{Name="TypeScript"; Command="npm install --save-dev typescript@latest"},
    @{Name="Vite"; Command="npm install --save-dev vite@latest"},
    @{Name="Tailwind"; Command="npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest"}
)

foreach ($tool in $tools) {
    Invoke-CommandWithTimeout -Command $tool.Command -TimeoutSeconds 120 -Description "Install $($tool.Name)"
}

# Step 6: Verify installations
Write-Host "`n6. Verifying installations..." -ForegroundColor Cyan

$verifications = @(
    @{Name="Node"; Command="node --version"},
    @{Name="NPM"; Command="npm --version"},
    @{Name="ESLint"; Command="npx eslint --version"},
    @{Name="TypeScript"; Command="npx tsc --version"},
    @{Name="Vite"; Command="npx vite --version"}
)

foreach ($verification in $verifications) {
    $result = Invoke-CommandWithTimeout -Command $verification.Command -TimeoutSeconds 10 -Description "Verify $($verification.Name)"
    if ($result) {
        Write-Host "✓ $($verification.Name): $result" -ForegroundColor Green
    } else {
        Write-Host "✗ $($verification.Name): Failed to verify" -ForegroundColor Red
    }
}

# Step 7: Create optimized configuration
Write-Host "`n7. Creating optimized configuration..." -ForegroundColor Cyan

# Create a simple ESLint config
$eslintConfig = @"
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
"@

$eslintConfig | Out-File -FilePath "eslint.config.simple.js" -Encoding UTF8
Write-Host "✓ Created simple ESLint config" -ForegroundColor Green

# Step 8: Create simple scripts
Write-Host "`n8. Creating simple scripts..." -ForegroundColor Cyan

# Simple start script
@"
@echo off
echo Starting development server...
timeout /t 2 /nobreak >nul
npm run dev
"@ | Out-File -FilePath "start-simple.bat" -Encoding ASCII

# Simple build script
@"
@echo off
echo Building project...
npm run build
"@ | Out-File -FilePath "build-simple.bat" -Encoding ASCII

# Simple lint script
@"
@echo off
echo Running ESLint...
npx eslint src --ext .ts,.tsx --config eslint.config.simple.js
"@ | Out-File -FilePath "lint-simple.bat" -Encoding ASCII

Write-Host "✓ Created simple batch scripts" -ForegroundColor Green

# Step 9: Final system check
Write-Host "`n9. Final system check..." -ForegroundColor Cyan

$checks = @(
    @{Name="package.json"; Path="package.json"},
    @{Name="node_modules"; Path="node_modules"},
    @{Name="React"; Path="node_modules\react"},
    @{Name="Vite"; Path="node_modules\vite"},
    @{Name="TypeScript"; Path="node_modules\typescript"},
    @{Name="ESLint"; Path="node_modules\eslint"}
)

foreach ($check in $checks) {
    if (Test-Path $check.Path) {
        Write-Host "✓ $($check.Name) exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $($check.Name) missing" -ForegroundColor Red
    }
}

Write-Host "`n=== ADVANCED SYSTEM FIX COMPLETED ===" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Try running: .\start-simple.bat" -ForegroundColor White
Write-Host "2. If issues persist, restart Cursor IDE" -ForegroundColor White
Write-Host "3. Check the created log files for errors" -ForegroundColor White
Write-Host "4. Try the simple batch scripts created" -ForegroundColor White

# Create a summary file
$summary = @"
Advanced System Fix Summary
==========================
Completed: $(Get-Date)
Node Version: $(node --version 2>$null)
NPM Version: $(npm --version 2>$null)
Dependencies: $(if (Test-Path "node_modules") { "Installed" } else { "Missing" })
ESLint: $(if (Test-Path "node_modules\eslint") { "Installed" } else { "Missing" })
TypeScript: $(if (Test-Path "node_modules\typescript") { "Installed" } else { "Missing" })
Vite: $(if (Test-Path "node_modules\vite") { "Installed" } else { "Missing" })

Created Files:
- start-simple.bat
- build-simple.bat
- lint-simple.bat
- eslint.config.simple.js

Next Steps:
1. Run start-simple.bat to test
2. Restart Cursor IDE if needed
3. Check for any error logs
"@

$summary | Out-File -FilePath "system-fix-summary.txt" -Encoding UTF8
Write-Host "✓ Created system fix summary" -ForegroundColor Green 