#!/bin/bash

echo "========================================="
echo "   АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ ОШИБОК"
echo "========================================="
echo ""

# 1. Проверка TypeScript ошибок
echo "[1/5] Проверка TypeScript..."
npm run build 2>&1 | tee build-errors.log
if [ $? -eq 0 ]; then
    echo "✅ TypeScript: OK"
else
    echo "❌ TypeScript: Есть ошибки (см. build-errors.log)"
fi
echo ""

# 2. Проверка ESLint
echo "[2/5] Проверка ESLint..."
npm run lint 2>&1 | tee lint-errors.log
if [ $? -eq 0 ]; then
    echo "✅ ESLint: OK"
else
    echo "⚠️  ESLint: Есть предупреждения (см. lint-errors.log)"
fi
echo ""

# 3. Поиск несуществующих импортов
echo "[3/5] Поиск несуществующих импортов..."
grep -r "from ['\"]\.\/ui['\"]" src/ 2>/dev/null && echo "❌ Найдены импорты из ./ui" || echo "✅ Импорты: OK"
echo ""

# 4. Поиск неиспользуемых переменных
echo "[4/5] Поиск неиспользуемых переменных..."
grep -r "const.*=.*useState" src/ | grep -v "set" | head -5
echo ""

# 5. Очистка кэша
echo "[5/5] Очистка кэша..."
rm -rf node_modules/.vite
rm -rf dist
echo "✅ Кэш очищен"
echo ""

echo "========================================="
echo "   ГОТОВО!"
echo "========================================="
echo ""
echo "Запустите: npm run dev"
