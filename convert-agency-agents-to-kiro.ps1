# PowerShell Script: Convert Agency Agents to Kiro Skills Format
# Usage: .\convert-agency-agents-to-kiro.ps1

param(
    [string]$AgencyAgentsPath = "./agency-agents",
    [string]$OutputPath = "./.kiro/skills",
    [string[]]$Categories = @(),
    [switch]$AllCategories,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Help message
if ($Help) {
    Write-Host @"
Agency Agents to Kiro Skills Converter
======================================

Usage:
  .\convert-agency-agents-to-kiro.ps1 [options]

Options:
  -AgencyAgentsPath <path>   Path to agency-agents repository (default: ./agency-agents)
  -OutputPath <path>         Output path for Kiro skills (default: ./.kiro/skills)
  -Categories <array>        Specific categories to convert (e.g., @("engineering", "design"))
  -AllCategories             Convert all categories
  -Help                      Show this help message

Examples:
  # Convert all categories
  .\convert-agency-agents-to-kiro.ps1 -AllCategories

  # Convert only engineering and design
  .\convert-agency-agents-to-kiro.ps1 -Categories @("engineering", "design")

  # Convert with custom paths
  .\convert-agency-agents-to-kiro.ps1 -AgencyAgentsPath "C:\repos\agency-agents" -OutputPath ".kiro\skills" -AllCategories

"@ -ForegroundColor Cyan
    exit 0
}

# Check if agency-agents exists
if (-not (Test-Path $AgencyAgentsPath)) {
    Write-Host "Error: Agency Agents repository not found at: $AgencyAgentsPath" -ForegroundColor Red
    Write-Host "Please clone it first:" -ForegroundColor Yellow
    Write-Host "  git clone https://github.com/msitarzewski/agency-agents.git" -ForegroundColor White
    exit 1
}

# Available categories
$availableCategories = @(
    "engineering",
    "design",
    "paid-media",
    "sales",
    "marketing",
    "product",
    "project-management",
    "testing",
    "support",
    "spatial-computing",
    "specialized",
    "game-development",
    "academic",
    "finance"
)

# Determine which categories to process
if ($AllCategories) {
    $Categories = $availableCategories
} elseif ($Categories.Count -eq 0) {
    # Interactive selection
    Write-Host "`nAvailable categories:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $availableCategories.Count; $i++) {
        Write-Host "  $($i + 1). $($availableCategories[$i])"
    }
    Write-Host "`nEnter category numbers (comma-separated) or 'all' for all categories:" -ForegroundColor Yellow
    $input = Read-Host
    
    if ($input -eq "all") {
        $Categories = $availableCategories
    } else {
        $indices = $input -split "," | ForEach-Object { [int]$_.Trim() - 1 }
        $Categories = $indices | ForEach-Object { $availableCategories[$_] }
    }
}

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
Write-Host "`nOutput directory: $OutputPath" -ForegroundColor Green

# Statistics
$totalConverted = 0
$totalSkipped = 0

# Process each category
foreach ($category in $Categories) {
    $categoryPath = Join-Path $AgencyAgentsPath $category
    
    if (-not (Test-Path $categoryPath)) {
        Write-Host "`n[!] Category not found: $category" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`n[*] Processing category: $category" -ForegroundColor Cyan
    
    $mdFiles = Get-ChildItem -Path $categoryPath -Filter "*.md" -ErrorAction SilentlyContinue
    
    if ($mdFiles.Count -eq 0) {
        Write-Host "  No .md files found in $category" -ForegroundColor Yellow
        continue
    }
    
    foreach ($file in $mdFiles) {
        try {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8
            
            # Extract agent name from filename
            $agentName = $file.BaseName -replace "^$category-", ""
            
            # Extract description from content (first paragraph after title)
            $description = ""
            if ($content -match '(?m)^#[^#].*?\n\n(.+?)(?:\n\n|\n#)') {
                $description = $matches[1].Trim() -replace '\n', ' '
                if ($description.Length > 150) {
                    $description = $description.Substring(0, 147) + "..."
                }
            }
            
            # Create Kiro-compatible frontmatter
            $frontmatter = "---`nname: $agentName`ncategory: $category`nsource: agency-agents`ndescription: $description`ninclusion: manual`n---`n`n"
            $kiroContent = $frontmatter + $content
            
            # Save to output
            $outputFile = Join-Path $OutputPath $file.Name
            [System.IO.File]::WriteAllText($outputFile, $kiroContent, [System.Text.Encoding]::UTF8)
            
            Write-Host "  [+] $($file.Name)" -ForegroundColor Green
            $totalConverted++
            
        } catch {
            Write-Host "  [-] Failed to convert $($file.Name): $_" -ForegroundColor Red
            $totalSkipped++
        }
    }
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "Conversion Summary" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "[+] Converted: $totalConverted agents" -ForegroundColor Green
if ($totalSkipped -gt 0) {
    Write-Host "[-] Skipped:   $totalSkipped agents" -ForegroundColor Yellow
}
Write-Host "[*] Output:    $OutputPath" -ForegroundColor Cyan

# Usage instructions
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "How to use in Kiro:" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host @"

1. Skills are now available in: $OutputPath

2. Activate a skill in Kiro:
   "Activate skill <agent-name> and help me with the task"

3. Examples:
   - "Activate skill frontend-developer and optimize ProductCard"
   - "Activate skill backend-architect and analyze API"
   - "Activate skill reality-checker and check production readiness"

4. List available skills:
   Get-ChildItem $OutputPath -Filter *.md | Select-Object Name

5. To make a skill always active, edit the file and change:
   inclusion: manual  ->  inclusion: auto

"@ -ForegroundColor White

Write-Host "Done!" -ForegroundColor Green
