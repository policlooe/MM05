# Fast Frontend Extraction - Part 2
$ErrorActionPreference = "Stop"
$outputFile = "FRONTEND_PART2.json"

Write-Host "Extracting Frontend Part 2 (Fast)..." -ForegroundColor Cyan

$data = @{
    metadata = @{
        project = "MM05"
        part = 2
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    files = @{}
}

# Paths to extract
$paths = @(
    "src/lib",
    "src/store",
    "src/data",
    "src/types",
    "src/services"
)

$count = 0
foreach ($path in $paths) {
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Filter "*.ts*" -Recurse -File
        foreach ($file in $files) {
            $rel = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            $data.files[$rel] = Get-Content $file.FullName -Raw -Encoding UTF8
            $count++
            if ($count % 10 -eq 0) { Write-Host "  Processed: $count files" -ForegroundColor Yellow }
        }
    }
}

# Add config files
$configs = @("vite.config.ts", "tailwind.config.ts", "tsconfig.json", "index.html", "src/main.tsx", "src/App.tsx")
foreach ($cfg in $configs) {
    if (Test-Path $cfg) {
        $data.files[$cfg] = Get-Content $cfg -Raw -Encoding UTF8
        $count++
    }
}

# Add CSS
$cssFiles = Get-ChildItem -Path "src" -Filter "*.css" -Recurse -File
foreach ($file in $cssFiles) {
    $rel = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $data.files[$rel] = Get-Content $file.FullName -Raw -Encoding UTF8
    $count++
}

Write-Host "`nConverting to JSON..." -ForegroundColor Cyan
$json = $data | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($outputFile, $json, [System.Text.Encoding]::UTF8)

Write-Host "Part 2 saved: $outputFile" -ForegroundColor Green
Write-Host "Total files: $count" -ForegroundColor Yellow
