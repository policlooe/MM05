@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 GitHub Setup для MM05
echo ========================================
echo.

REM Проверка git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git не установлен!
    echo.
    echo Скачайте Git: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo ✅ Git найден
echo.

REM Инициализация репозитория
echo 📦 Инициализация Git репозитория...
git init
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка инициализации
    pause
    exit /b 1
)
echo ✅ Репозиторий инициализирован
echo.

REM Добавление файлов
echo 📁 Добавление файлов...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка добавления файлов
    pause
    exit /b 1
)
echo ✅ Файлы добавлены
echo.

REM Создание коммита
echo 💾 Создание коммита...
git commit -m "Initial commit: MM05 furniture store"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка создания коммита
    pause
    exit /b 1
)
echo ✅ Коммит создан
echo.

REM Переименование ветки
echo 🔄 Переименование ветки в main...
git branch -M main
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка переименования ветки
    pause
    exit /b 1
)
echo ✅ Ветка переименована
echo.

echo ========================================
echo   ✅ Git репозиторий готов!
echo ========================================
echo.
echo 📋 Следующие шаги:
echo.
echo 1. Создайте репозиторий на GitHub:
echo    https://github.com/new
echo.
echo 2. Выполните команды (замените YOUR_USERNAME):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/mm05-furniture-store.git
echo    git push -u origin main
echo.
echo 3. Импортируйте в Vercel:
echo    https://vercel.com/new
echo.
echo ========================================
echo.
pause
