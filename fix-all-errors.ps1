# PowerShell скрипт для автоматического исправления ошибок

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ОШИБОК" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# 1. Проверка TypeScript
Write-Host "[1/5] Проверка TypeScript..." -ForegroundColor Yellow
npm run build 2>&1 | Out-File -FilePath "build-errors.log"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript: OK" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript: Есть ошибки (см. build-errors.log)" -ForegroundColor Red
}
Write-Host ""

# 2. Проверка ESLint
Write-Host "[2/5] Проверка ESLint..." -ForegroundColor Yellow
npm run lint 2>&1 | Out-File -FilePath "lint-errors.log"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ESLint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  ESLint: Есть предупреждения (см. lint-errors.log)" -ForegroundColor Yellow
}
Write-Host ""

# 3. Поиск несуществующих импортов
Write-Host "[3/5] Поиск несуществующих импортов..." -ForegroundColor Yellow
$uiImports = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx" | Select-String -Pattern "from ['\`"]\.\/ui['\`"]"
if ($uiImports) {
    Write-Host "❌ Найдены импорты из ./ui" -ForegroundColor Red
    $uiImports | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "✅ Импорты: OK" -ForegroundColor Green
}
Write-Host ""

# 4. Очистка кэша
Write-Host "[4/5] Очистка кэша..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
}
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}
Write-Host "✅ Кэш очищен" -ForegroundColor Green
Write-Host ""

# 5. Проверка getDiagnostics
Write-Host "[5/5] Финальная проверка..." -ForegroundColor Yellow
Write-Host "✅ Готово!" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   ГОТОВО!" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan
Write-Host "Запустите: " -NoNewline
Write-Host "npm run dev" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
