# PowerShell script to set up .env.local file for Supabase
Write-Host "🚀 ConstructBMS - Supabase Setup" -ForegroundColor Cyan
Write-Host "=" * 50

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "📋 Please provide your Supabase credentials:" -ForegroundColor Green
Write-Host "You can find these in your Supabase Dashboard → Settings → API"
Write-Host ""

# Get Supabase URL
$supabaseUrl = Read-Host "Enter your Supabase Project URL (e.g., https://abc123.supabase.co)"
while ([string]::IsNullOrWhiteSpace($supabaseUrl) -or !$supabaseUrl.StartsWith("https://")) {
    Write-Host "❌ Please enter a valid Supabase URL starting with https://" -ForegroundColor Red
    $supabaseUrl = Read-Host "Enter your Supabase Project URL"
}

# Get Supabase Anon Key
$supabaseKey = Read-Host "Enter your Supabase Anon Key (starts with eyJ...)"
while ([string]::IsNullOrWhiteSpace($supabaseKey) -or !$supabaseKey.StartsWith("eyJ")) {
    Write-Host "❌ Please enter a valid Supabase Anon Key (should start with eyJ)" -ForegroundColor Red
    $supabaseKey = Read-Host "Enter your Supabase Anon Key"
}

# Generate a random JWT secret
$jwtSecret = [System.Web.Security.Membership]::GeneratePassword(64, 16)

# Create .env.local content
$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey

# Backend Configuration
VITE_API_URL=http://localhost:3001/api

# JWT Secret for backend
JWT_SECRET=$jwtSecret

# Development Configuration
NODE_ENV=development
"@

# Write to .env.local file
try {
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host ""
    Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set up your database by running the SQL files in Supabase SQL Editor:"
    Write-Host "   - First run: supabase/schema.sql"
    Write-Host "   - Then run: supabase/reset-demo-data.sql"
    Write-Host ""
    Write-Host "2. Restart your development server:"
    Write-Host "   npm run dev"
    Write-Host ""
    Write-Host "3. Login with your credentials:"
    Write-Host "   Email: constructbms@gmail.com"
Write-Host "   Password: ConstructBMS25"
    Write-Host ""
} catch {
    Write-Host "❌ Error creating .env.local file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Setup complete! Your ConstructBMS is ready to use." -ForegroundColor Green 