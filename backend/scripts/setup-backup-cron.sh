#!/bin/bash

# Скрипт для настройки автоматических бэкапов через cron
# Использование: bash setup-backup-cron.sh

echo "🔧 Настройка автоматических бэкапов базы данных"
echo "═══════════════════════════════════════════════════════════════"

# Путь к проекту
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Создаем cron задачу (каждый день в 3:00 AM)
CRON_JOB="0 3 * * * cd $PROJECT_DIR && npm run backup >> $PROJECT_DIR/logs/backup.log 2>&1"

# Проверяем, существует ли уже задача
if crontab -l 2>/dev/null | grep -q "npm run backup"; then
    echo "⚠️  Cron задача уже существует"
else
    # Добавляем задачу
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cron задача добавлена: ежедневно в 3:00 AM"
fi

# Создаем директорию для логов
mkdir -p "$PROJECT_DIR/logs"

echo ""
echo "📋 Текущие cron задачи:"
crontab -l | grep backup

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Настройка завершена!"
echo ""
echo "💡 Для ручного запуска бэкапа:"
echo "   cd backend && npm run backup"
echo ""
echo "📁 Бэкапы сохраняются в: $PROJECT_DIR/backups"
echo "📝 Логи сохраняются в: $PROJECT_DIR/logs/backup.log"
echo "═══════════════════════════════════════════════════════════════"
