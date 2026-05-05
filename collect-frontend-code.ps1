# Script to collect all frontend code into a JSON file
$outputFile = "FRONTEND_CODE_COMPLETE.json"
$result = @{}

# Get all TypeScript and CSS files
$files = Get-ChildItem -Path src -Recurse -File -Include *.tsx,*.ts,*.css,*.json -Exclude *.test.ts,*.test.tsx,node_modules

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '').Replace('\', '/')
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $result[$relativePath] = $content
}

# Convert to JSON and save
$jsonOutput = $result | ConvertTo-Json -Depth 100
$jsonOutput | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✅ Collected $($files.Count) files"
Write-Host "📁 Output: $outputFile"
Write-Host "📊 Size: $([math]::Round((Get-Item $outputFile).Length / 1MB, 2)) MB"
