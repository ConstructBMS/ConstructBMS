# Supabase Database Migration Tool
# PowerShell Version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Supabase Database Migration Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you migrate your Supabase database" -ForegroundColor Yellow
Write-Host "from your personal account to the new ConstructBMS account." -ForegroundColor Yellow
Write-Host ""

Write-Host "Please ensure you have:" -ForegroundColor Yellow
Write-Host "1. PostgreSQL client tools installed (pg_dump, psql)" -ForegroundColor White
Write-Host "2. Access to both Supabase projects" -ForegroundColor White
Write-Host "3. Database passwords for both projects" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"

Write-Host ""
Write-Host "Step 1: Setting up environment variables..." -ForegroundColor Green
Write-Host ""

# Get user input
$sourceDbPassword = Read-Host "Enter your SOURCE database password" -AsSecureString
$targetSupabaseUrl = Read-Host "Enter your TARGET Supabase URL"
$targetDbPassword = Read-Host "Enter your TARGET database password" -AsSecureString

# Convert secure strings to plain text for environment variables
$sourceDbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sourceDbPassword))
$targetDbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($targetDbPassword))

# Set environment variables
$env:SOURCE_DB_PASSWORD = $sourceDbPasswordPlain
$env:TARGET_SUPABASE_URL = $targetSupabaseUrl
$env:TARGET_DB_PASSWORD = $targetDbPasswordPlain

Write-Host ""
Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Checking prerequisites..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL tools are available
try {
    $pgDumpVersion = pg_dump --version
    Write-Host "✅ pg_dump found: $pgDumpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "You can download them from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

try {
    $psqlVersion = psql --version
    Write-Host "✅ psql found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Running migration script..." -ForegroundColor Green
Write-Host ""

# Run the migration script
try {
    node scripts/simple-migrate.js
    $migrationSuccess = $LASTEXITCODE -eq 0
} catch {
    $migrationSuccess = $false
    Write-Host "❌ Error running migration script: $_" -ForegroundColor Red
}

Write-Host ""

if ($migrationSuccess) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   Migration completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update your .env file with new credentials" -ForegroundColor White
    Write-Host "2. Test your application thoroughly" -ForegroundColor White
    Write-Host "3. Update production environment variables" -ForegroundColor White
    Write-Host "4. Close the old Supabase project" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   Migration failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    Write-Host ""
}

# Clean up environment variables
Remove-Item Env:SOURCE_DB_PASSWORD -ErrorAction SilentlyContinue
Remove-Item Env:TARGET_SUPABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:TARGET_DB_PASSWORD -ErrorAction SilentlyContinue

Read-Host "Press Enter to exit" 