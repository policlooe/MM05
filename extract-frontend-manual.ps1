# Manual JSON Generation - Part 2
$outputFile = "FRONTEND_PART2.json"
Write-Host "Extracting Part 2 (Manual JSON)..." -ForegroundColor Cyan

$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine('{')
[void]$sb.AppendLine('  "metadata": {')
[void]$sb.AppendLine('    "project": "MM05",')
[void]$sb.AppendLine('    "part": 2,')
[void]$sb.AppendLine('    "timestamp": "' + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") + '"')
[void]$sb.AppendLine('  },')
[void]$sb.AppendLine('  "files": {')

$paths = @("src/lib", "src/store", "src/data", "src/types", "src/services")
$first = $true
$count = 0

foreach ($path in $paths) {
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Filter "*.ts*" -Recurse -File
        foreach ($file in $files) {
            if (-not $first) { [void]$sb.AppendLine(',') }
            $first = $false
            
            $rel = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
            $content = (Get-Content $file.FullName -Raw -Encoding UTF8) -replace '"', '\"' -replace '\\', '\\' -replace "`r`n", "\n" -replace "`n", "\n"
            
            [void]$sb.Append('    "' + $rel + '": "' + $content + '"')
            $count++
            if ($count % 5 -eq 0) { Write-Host "  $count files" -ForegroundColor Yellow }
        }
    }
}

# Config files
$configs = @("vite.config.ts", "tailwind.config.ts", "tsconfig.json", "src/main.tsx", "src/App.tsx")
foreach ($cfg in $configs) {
    if (Test-Path $cfg) {
        [void]$sb.AppendLine(',')
        $content = (Get-Content $cfg -Raw -Encoding UTF8) -replace '"', '\"' -replace '\\', '\\' -replace "`r`n", "\n" -replace "`n", "\n"
        [void]$sb.Append('    "' + $cfg + '": "' + $content + '"')
        $count++
    }
}

[void]$sb.AppendLine('')
[void]$sb.AppendLine('  }')
[void]$sb.AppendLine('}')

[System.IO.File]::WriteAllText($outputFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "`nSaved: $outputFile ($count files)" -ForegroundColor Green
