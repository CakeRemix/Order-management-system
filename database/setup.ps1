# GIU Food Truck Order Management System
# Database Setup Script for Windows PowerShell
# ==================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "GIU Food Truck Database Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env file if it exists
if (Test-Path "../.env") {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Yellow
    Get-Content "../.env" | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
} else {
    Write-Host "No .env file found. Using default values..." -ForegroundColor Yellow
}

# Database configuration
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "giu_food_truck_db" }

Write-Host "Database Configuration:" -ForegroundColor Green
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host ""

# Set PGPASSWORD environment variable
if ($env:DB_PASSWORD) {
    $env:PGPASSWORD = $env:DB_PASSWORD
} else {
    Write-Host "Enter PostgreSQL password for user '$DB_USER':" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

Write-Host ""
Write-Host "Step 1: Creating database '$DB_NAME' (if not exists)..." -ForegroundColor Cyan

# Check if database exists
$dbExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>$null

if ($dbExists -eq "1") {
    Write-Host "  Database '$DB_NAME' already exists." -ForegroundColor Yellow
    $response = Read-Host "  Do you want to drop and recreate it? (yes/no)"
    if ($response -eq "yes") {
        Write-Host "  Dropping existing database..." -ForegroundColor Red
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE $DB_NAME;"
        Write-Host "  Creating new database..." -ForegroundColor Green
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    }
} else {
    Write-Host "  Creating database..." -ForegroundColor Green
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
}

Write-Host ""
Write-Host "Step 2: Running schema.sql..." -ForegroundColor Cyan
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Schema created successfully!" -ForegroundColor Green
} else {
    Write-Host "  Error creating schema!" -ForegroundColor Red
    exit 1
}

Write-Host ""
$seedResponse = Read-Host "Do you want to seed the database with sample data? (yes/no)"

if ($seedResponse -eq "yes") {
    Write-Host ""
    Write-Host "Step 3: Seeding database with sample data..." -ForegroundColor Cyan
    
    Push-Location "seeds"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "seed_all.sql"
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Database seeded successfully!" -ForegroundColor Green
    } else {
        Write-Host "  Error seeding database!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connection String:" -ForegroundColor Yellow
Write-Host "  postgresql://$DB_USER@${DB_HOST}:${DB_PORT}/$DB_NAME" -ForegroundColor White
Write-Host ""
Write-Host "You can now start your application!" -ForegroundColor Green
Write-Host ""

# Clean up password
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
