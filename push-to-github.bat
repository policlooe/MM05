@echo off
echo ========================================
echo   ОТПРАВКА ИЗМЕНЕНИЙ НА GITHUB
echo ========================================
echo.

echo Добавление всех изменений...
git add .

echo.
echo Создание коммита...
git commit -m "feat: product configuration system + UI improvements - Implemented cart with configuration support - Integrated ProductConfigurator into ProductPage - Added configuration display in cart - Fixed header layout (icons always right of search) - Replaced cart with contacts in mobile nav"

echo.
echo Отправка на GitHub...
git push origin main

echo.
echo ========================================
echo   ГОТОВО!
echo ========================================
echo.
echo Проверьте изменения на GitHub:
echo https://github.com/policlooe/MM05
echo.
pause
