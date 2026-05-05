# PowerShell script to collect all backend code into JSON files
# Part 1: Configuration, Core, Controllers
# Part 2: Services, Middleware, Routes
# Part 3: Utils, Validators, Scripts

$ErrorActionPreference = "Stop"

Write-Host "Collecting backend code..." -ForegroundColor Green

# Part 1: Configuration and Core files
$part1 = @{}

# Config files
$part1["package.json"] = Get-Content "package.json" -Raw
$part1["backend/tsconfig.json"] = Get-Content "backend/tsconfig.json" -Raw
$part1["backend/.env.example"] = Get-Content "backend/.env.example" -Raw
$part1["backend/docker-compose.yml"] = Get-Content "backend/docker-compose.yml" -Raw
$part1["backend/prisma/schema.prisma"] = Get-Content "backend/prisma/schema.prisma" -Raw

# Core files
$part1["backend/src/app.ts"] = Get-Content "backend/src/app.ts" -Raw
$part1["backend/src/server.ts"] = Get-Content "backend/src/server.ts" -Raw

# Controllers
Get-ChildItem -Path "backend/src/controllers" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/controllers/$($_.Name)"
    $part1[$key] = Get-Content $_.FullName -Raw
}

$part1Json = $part1 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("BACKEND_CODE_PART1.json", $part1Json, [System.Text.Encoding]::UTF8)
Write-Host "Part 1 saved: BACKEND_CODE_PART1.json" -ForegroundColor Cyan

# Part 2: Services, Middleware, Routes
$part2 = @{}

# Services
Get-ChildItem -Path "backend/src/services" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/services/$($_.Name)"
    $part2[$key] = Get-Content $_.FullName -Raw
}

# Middleware
Get-ChildItem -Path "backend/src/middleware" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/middleware/$($_.Name)"
    $part2[$key] = Get-Content $_.FullName -Raw
}

# Routes
Get-ChildItem -Path "backend/src/routes" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/routes/$($_.Name)"
    $part2[$key] = Get-Content $_.FullName -Raw
}

# Lib
Get-ChildItem -Path "backend/src/lib" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/lib/$($_.Name)"
    $part2[$key] = Get-Content $_.FullName -Raw
}

$part2Json = $part2 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("BACKEND_CODE_PART2.json", $part2Json, [System.Text.Encoding]::UTF8)
Write-Host "Part 2 saved: BACKEND_CODE_PART2.json" -ForegroundColor Cyan

# Part 3: Utils, Validators, Scripts, Migrations
$part3 = @{}

# Utils
Get-ChildItem -Path "backend/src/utils" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/utils/$($_.Name)"
    $part3[$key] = Get-Content $_.FullName -Raw
}

# Validators
Get-ChildItem -Path "backend/src/validators" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/validators/$($_.Name)"
    $part3[$key] = Get-Content $_.FullName -Raw
}

# Repositories
Get-ChildItem -Path "backend/src/repositories" -Filter "*.ts" | ForEach-Object {
    $key = "backend/src/repositories/$($_.Name)"
    $part3[$key] = Get-Content $_.FullName -Raw
}

# Scripts
Get-ChildItem -Path "backend/scripts" -Filter "*.ts" | ForEach-Object {
    $key = "backend/scripts/$($_.Name)"
    $part3[$key] = Get-Content $_.FullName -Raw
}

Get-ChildItem -Path "backend/scripts" -Filter "*.sh" | ForEach-Object {
    $key = "backend/scripts/$($_.Name)"
    $part3[$key] = Get-Content $_.FullName -Raw
}

# Migrations
$migrations = @()
Get-ChildItem -Path "backend/prisma/migrations" -Recurse -Filter "migration.sql" | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $migrations += @{
        path = $relativePath
        content = Get-Content $_.FullName -Raw
    }
}
$part3["migrations"] = $migrations

$part3Json = $part3 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("BACKEND_CODE_PART3.json", $part3Json, [System.Text.Encoding]::UTF8)
Write-Host "Part 3 saved: BACKEND_CODE_PART3.json" -ForegroundColor Cyan

Write-Host "`nAll backend code collected successfully!" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "  - BACKEND_CODE_PART1.json (Config + Core + Controllers)" -ForegroundColor White
Write-Host "  - BACKEND_CODE_PART2.json (Services + Middleware + Routes)" -ForegroundColor White
Write-Host "  - BACKEND_CODE_PART3.json (Utils + Validators + Scripts + Migrations)" -ForegroundColor White
