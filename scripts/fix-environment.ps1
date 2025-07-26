# Fix Environment and Clear Caches Script
# This script fixes terminal issues and clears all caches

Write-Host "🔧 Fixing environment and clearing caches..." -ForegroundColor Green

try {
    # 1. Fix PowerShell execution policy
    Write-Host "1. Fixing PowerShell execution policy..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "   ✅ Execution policy set to RemoteSigned" -ForegroundColor Green

    # 2. Kill any existing Node.js processes
    Write-Host "2. Killing existing Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "   ✅ Killed $($nodeProcesses.Count) Node.js processes" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  No Node.js processes found" -ForegroundColor Cyan
    }

    # 3. Clear npm cache
    Write-Host "3. Clearing npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    Write-Host "   ✅ NPM cache cleared" -ForegroundColor Green

    # 4. Clear project caches
    Write-Host "4. Clearing project caches..." -ForegroundColor Yellow
    $cacheDirs = @(".cache", ".vite", "dist", "build", "node_modules\.vite")
    foreach ($dir in $cacheDirs) {
        if (Test-Path $dir) {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Cleared $dir" -ForegroundColor Green
        }
    }

    # 5. Clear TypeScript cache
    Write-Host "5. Clearing TypeScript cache..." -ForegroundColor Yellow
    if (Test-Path "node_modules\.cache\.tsbuildinfo") {
        Remove-Item -Path "node_modules\.cache\.tsbuildinfo" -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ TypeScript cache cleared" -ForegroundColor Green
    }

    # 6. Reinstall dependencies
    Write-Host "6. Reinstalling dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "   ✅ Dependencies reinstalled" -ForegroundColor Green

    # 7. Test terminal
    Write-Host "7. Testing terminal..." -ForegroundColor Yellow
    $testResult = npm --version
    Write-Host "   ✅ Terminal working - NPM version: $testResult" -ForegroundColor Green

    # 8. Test Git
    Write-Host "8. Testing Git..." -ForegroundColor Yellow
    $gitResult = git --version
    Write-Host "   ✅ Git working - Version: $gitResult" -ForegroundColor Green

    Write-Host ""
    Write-Host "🎉 Environment fixed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start development server: npm run dev" -ForegroundColor White
    Write-Host "2. Or start full stack: npm run dev:full" -ForegroundColor White
    Write-Host "3. Or start with Supabase: npm run dev:supabase" -ForegroundColor White

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 