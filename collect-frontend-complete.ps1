# Collect all frontend code into two JSON files
$ErrorActionPreference = "Continue"

# Part 1: Main source files
$part1 = @{
    metadata = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        description = "Frontend Code Part 1 - Main source files"
        totalFiles = 0
    }
    files = @{}
}

# Part 2: Components and pages
$part2 = @{
    metadata = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        description = "Frontend Code Part 2 - Components and pages"
        totalFiles = 0
    }
    files = @{}
}

Write-Host "Collecting frontend code..." -ForegroundColor Green

# Part 1 files: Root, lib, services, store, types, hooks, data
$part1Patterns = @(
    "src/*.tsx",
    "src/*.ts",
    "src/*.css",
    "src/lib/**/*.ts",
    "src/lib/**/*.tsx",
    "src/services/**/*.ts",
    "src/services/**/*.tsx",
    "src/store/**/*.ts",
    "src/store/**/*.tsx",
    "src/types/**/*.ts",
    "src/hooks/**/*.ts",
    "src/hooks/**/*.tsx",
    "src/data/**/*.ts",
    "src/integrations/**/*.ts"
)

foreach ($pattern in $part1Patterns) {
    $files = Get-ChildItem -Path $pattern -Recurse -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $part1.files[$relativePath] = $content
            $part1.metadata.totalFiles++
            Write-Host "  [Part 1] $relativePath" -ForegroundColor Cyan
        } catch {
            Write-Host "  [ERROR] Failed to read $relativePath" -ForegroundColor Red
        }
    }
}

# Part 2 files: Components and pages
$part2Patterns = @(
    "src/components/**/*.tsx",
    "src/components/**/*.ts",
    "src/pages/**/*.tsx",
    "src/pages/**/*.ts"
)

foreach ($pattern in $part2Patterns) {
    $files = Get-ChildItem -Path $pattern -Recurse -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            $part2.files[$relativePath] = $content
            $part2.metadata.totalFiles++
            Write-Host "  [Part 2] $relativePath" -ForegroundColor Yellow
        } catch {
            Write-Host "  [ERROR] Failed to read $relativePath" -ForegroundColor Red
        }
    }
}

# Save to JSON files
Write-Host "`nSaving to JSON files..." -ForegroundColor Green

$part1Json = $part1 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("FRONTEND_COMPLETE_PART1.json", $part1Json, [System.Text.Encoding]::UTF8)
Write-Host "  Saved FRONTEND_COMPLETE_PART1.json ($($part1.metadata.totalFiles) files)" -ForegroundColor Green

$part2Json = $part2 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("FRONTEND_COMPLETE_PART2.json", $part2Json, [System.Text.Encoding]::UTF8)
Write-Host "  Saved FRONTEND_COMPLETE_PART2.json ($($part2.metadata.totalFiles) files)" -ForegroundColor Green

Write-Host "`nDone! Total files: $($part1.metadata.totalFiles + $part2.metadata.totalFiles)" -ForegroundColor Green
