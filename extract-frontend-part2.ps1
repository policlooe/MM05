# Extract Frontend Code - Part 2 (Lib, Store, Data, Types, Config)
$ErrorActionPreference = "Stop"
$outputFile = "FRONTEND_PART2.json"

Write-Host "Extracting Frontend Part 2..." -ForegroundColor Cyan

$frontendData = @{
    metadata = @{
        project = "MM05"
        part = 2
        description = "Lib, Store, Data, Types, Config, Styles"
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    lib = @{}
    store = @{}
    data = @{}
    types = @{}
    config = @{}
    styles = @{}
    root = @{}
}

# Get lib files
$libFiles = Get-ChildItem -Path "src/lib" -Filter "*.ts*" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $libFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.lib[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Get store files
$storeFiles = Get-ChildItem -Path "src/store" -Filter "*.ts*" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $storeFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.store[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Get data files
$dataFiles = Get-ChildItem -Path "src/data" -Filter "*.ts*" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $dataFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.data[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Get types files
$typesFiles = Get-ChildItem -Path "src/types" -Filter "*.ts*" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $typesFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.types[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Get services files
if (Test-Path "src/services") {
    $serviceFiles = Get-ChildItem -Path "src/services" -Filter "*.ts*" -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $serviceFiles) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $frontendData.lib[$relativePath] = $content
        Write-Host "  Added: $relativePath" -ForegroundColor Green
    }
}

# Get config files
$configFiles = @(
    "vite.config.ts",
    "tailwind.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "postcss.config.js",
    "components.json",
    "index.html"
)

foreach ($configFile in $configFiles) {
    if (Test-Path $configFile) {
        $content = Get-Content $configFile -Raw -Encoding UTF8
        $frontendData.config[$configFile] = $content
        Write-Host "  Added: $configFile" -ForegroundColor Green
    }
}

# Get root src files
$rootFiles = Get-ChildItem -Path "src" -Filter "*.ts*" -File -ErrorAction SilentlyContinue
foreach ($file in $rootFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.root[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Get CSS files
$cssFiles = Get-ChildItem -Path "src" -Filter "*.css" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $cssFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.styles[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Convert to JSON and save
$json = $frontendData | ConvertTo-Json -Depth 10 -Compress:$false
[System.IO.File]::WriteAllText($outputFile, $json, [System.Text.Encoding]::UTF8)

Write-Host "`nPart 2 saved to: $outputFile" -ForegroundColor Green
Write-Host "Lib files: $($frontendData.lib.Count)" -ForegroundColor Yellow
Write-Host "Store files: $($frontendData.store.Count)" -ForegroundColor Yellow
Write-Host "Data files: $($frontendData.data.Count)" -ForegroundColor Yellow
Write-Host "Types files: $($frontendData.types.Count)" -ForegroundColor Yellow
Write-Host "Config files: $($frontendData.config.Count)" -ForegroundColor Yellow
Write-Host "Styles files: $($frontendData.styles.Count)" -ForegroundColor Yellow
Write-Host "Root files: $($frontendData.root.Count)" -ForegroundColor Yellow
