@echo off
chcp 65001 >nul
echo ========================================
echo Git Setup для MM05 Furniture Store
echo ========================================
echo.

echo [1/4] Добавление файлов в git...
git add .
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось добавить файлы
    pause
    exit /b 1
)
echo ✓ Файлы добавлены

echo.
echo [2/4] Создание коммита...
git commit -m "Initial commit: MM05 furniture store ready for Vercel deploy"
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось создать коммит
    pause
    exit /b 1
)
echo ✓ Коммит создан

echo.
echo [3/4] Переименование ветки в main...
git branch -M main
echo ✓ Ветка переименована

echo.
echo [4/4] Готово!
echo.
echo ========================================
echo Следующие шаги:
echo ========================================
echo 1. Создайте репозиторий на GitHub
echo 2. Выполните команду:
echo    git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
echo 3. Загрузите код:
echo    git push -u origin main
echo.
echo Подробная инструкция: GITHUB_SETUP.md
echo ========================================
pause
