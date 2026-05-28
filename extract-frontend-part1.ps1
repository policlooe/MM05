# Extract Frontend Code - Part 1 (Components & Pages)
$ErrorActionPreference = "Stop"
$outputFile = "FRONTEND_PART1.json"

Write-Host "Extracting Frontend Part 1..." -ForegroundColor Cyan

$frontendData = @{
    metadata = @{
        project = "MM05"
        part = 1
        description = "Components and Pages"
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    components = @{}
    pages = @{}
}

# Get all component files
$componentFiles = Get-ChildItem -Path "src/components" -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $componentFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.components[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Get all page files
$pageFiles = Get-ChildItem -Path "src/pages" -Filter "*.tsx" -Recurse -ErrorAction SilentlyContinue
foreach ($file in $pageFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $frontendData.pages[$relativePath] = $content
    Write-Host "  Added: $relativePath" -ForegroundColor Green
}

# Convert to JSON and save
$json = $frontendData | ConvertTo-Json -Depth 10 -Compress:$false
[System.IO.File]::WriteAllText($outputFile, $json, [System.Text.Encoding]::UTF8)

Write-Host "`nPart 1 saved to: $outputFile" -ForegroundColor Green
Write-Host "Components: $($frontendData.components.Count)" -ForegroundColor Yellow
Write-Host "Pages: $($frontendData.pages.Count)" -ForegroundColor Yellow
