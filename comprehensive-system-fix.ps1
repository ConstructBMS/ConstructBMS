# Comprehensive System Fix Script for ConstructBMS
# This script will perform a complete cleanup and reinstallation

Write-Host "=== COMPREHENSIVE SYSTEM FIX STARTING ===" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow

# Step 1: Check current system state
Write-Host "`n1. Checking system state..." -ForegroundColor Cyan
Write-Host "Node version: $(node --version 2>$null)" -ForegroundColor White
Write-Host "NPM version: $(npm --version 2>$null)" -ForegroundColor White
Write-Host "Current directory: $(Get-Location)" -ForegroundColor White

# Step 2: Kill any hanging processes
Write-Host "`n2. Killing hanging processes..." -ForegroundColor Cyan
$processes = @("node", "npm", "vite", "eslint", "typescript", "tailwind")
foreach ($proc in $processes) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Killed $proc processes" -ForegroundColor Yellow
}

# Step 3: Clear all caches
Write-Host "`n3. Clearing caches..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# Clear global npm cache
Write-Host "Clearing global npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null

# Step 4: Check and fix npm configuration
Write-Host "`n4. Checking npm configuration..." -ForegroundColor Cyan
npm config set registry https://registry.npmjs.org/ 2>$null
npm config set fetch-retries 3 2>$null
npm config set fetch-retry-mintimeout 5000 2>$null
npm config set fetch-retry-maxtimeout 60000 2>$null

# Step 5: Reinstall dependencies with verbose output
Write-Host "`n5. Reinstalling dependencies..." -ForegroundColor Cyan
Write-Host "Installing dependencies with verbose output..." -ForegroundColor Yellow
npm install --verbose --no-optional 2>&1 | Tee-Object -FilePath "npm-install.log"

# Step 6: Install ESLint globally and locally
Write-Host "`n6. Installing ESLint..." -ForegroundColor Cyan
Write-Host "Installing ESLint globally..." -ForegroundColor Yellow
npm install -g eslint@latest 2>$null
Write-Host "Installing ESLint locally..." -ForegroundColor Yellow
npm install --save-dev eslint@latest 2>$null

# Step 7: Install TypeScript globally and locally
Write-Host "`n7. Installing TypeScript..." -ForegroundColor Cyan
Write-Host "Installing TypeScript globally..." -ForegroundColor Yellow
npm install -g typescript@latest 2>$null
Write-Host "Installing TypeScript locally..." -ForegroundColor Yellow
npm install --save-dev typescript@latest 2>$null

# Step 8: Install Vite globally and locally
Write-Host "`n8. Installing Vite..." -ForegroundColor Cyan
Write-Host "Installing Vite globally..." -ForegroundColor Yellow
npm install -g vite@latest 2>$null
Write-Host "Installing Vite locally..." -ForegroundColor Yellow
npm install --save-dev vite@latest 2>$null

# Step 9: Install Tailwind CSS
Write-Host "`n9. Installing Tailwind CSS..." -ForegroundColor Cyan
npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest 2>$null

# Step 10: Verify installations
Write-Host "`n10. Verifying installations..." -ForegroundColor Cyan
Write-Host "Node version: $(node --version 2>$null)" -ForegroundColor White
Write-Host "NPM version: $(npm --version 2>$null)" -ForegroundColor White
Write-Host "ESLint version: $(eslint --version 2>$null)" -ForegroundColor White
Write-Host "TypeScript version: $(tsc --version 2>$null)" -ForegroundColor White
Write-Host "Vite version: $(vite --version 2>$null)" -ForegroundColor White

# Step 11: Test basic functionality
Write-Host "`n11. Testing basic functionality..." -ForegroundColor Cyan
Write-Host "Testing npm list..." -ForegroundColor Yellow
npm list --depth=0 2>$null

Write-Host "Testing ESLint..." -ForegroundColor Yellow
npx eslint --version 2>$null

Write-Host "Testing TypeScript..." -ForegroundColor Yellow
npx tsc --version 2>$null

Write-Host "Testing Vite..." -ForegroundColor Yellow
npx vite --version 2>$null

# Step 12: Create optimized scripts
Write-Host "`n12. Creating optimized scripts..." -ForegroundColor Cyan

# Create a simple start script
@"
@echo off
echo Starting development server...
npm run dev
"@ | Out-File -FilePath "start-simple.bat" -Encoding ASCII

# Create a simple build script
@"
@echo off
echo Building project...
npm run build
"@ | Out-File -FilePath "build-simple.bat" -Encoding ASCII

# Create a simple lint script
@"
@echo off
echo Running ESLint...
npx eslint src --ext .ts,.tsx
"@ | Out-File -FilePath "lint-simple.bat" -Encoding ASCII

Write-Host "Created optimized batch scripts" -ForegroundColor Green

# Step 13: Final system check
Write-Host "`n13. Final system check..." -ForegroundColor Cyan
Write-Host "Checking for common issues..." -ForegroundColor Yellow

# Check if package.json exists and is valid
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        Write-Host "✓ package.json is valid" -ForegroundColor Green
    } catch {
        Write-Host "✗ package.json has issues" -ForegroundColor Red
    }
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✓ node_modules directory exists" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules directory missing" -ForegroundColor Red
}

# Check if key dependencies are installed
$keyDeps = @("react", "vite", "typescript", "eslint")
foreach ($dep in $keyDeps) {
    if (Test-Path "node_modules/$dep") {
        Write-Host "✓ $dep is installed" -ForegroundColor Green
    } else {
        Write-Host "✗ $dep is missing" -ForegroundColor Red
    }
}

Write-Host "`n=== COMPREHENSIVE SYSTEM FIX COMPLETED ===" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Try running: npm run dev" -ForegroundColor White
Write-Host "2. If issues persist, check npm-install.log for errors" -ForegroundColor White
Write-Host "3. Try the simple batch scripts created" -ForegroundColor White
Write-Host "4. Restart Cursor IDE if needed" -ForegroundColor White 