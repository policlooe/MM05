#!/usr/bin/env node

/**
 * Скрипт для создания бэкапа PostgreSQL базы данных
 * Использование: npm run backup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Конфигурация
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 30; // Хранить последние 30 бэкапов (1 месяц при ежедневном бэкапе)
const COMPRESS_BACKUPS = true; // Сжимать бэкапы для экономии места

/**
 * Парсинг DATABASE_URL
 */
function parseDatabaseUrl(url: string) {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Неверный формат DATABASE_URL');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5].split('?')[0], // Убираем query параметры
  };
}

/**
 * Создание директории для бэкапов
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Создана директория для бэкапов: ${BACKUP_DIR}`);
  }
}

/**
 * Создание бэкапа
 */
async function createBackup() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL не найден в переменных окружения');
  }

  const db = parseDatabaseUrl(databaseUrl);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `mm05_backup_${timestamp}.sql`);
  const compressedFile = `${backupFile}.gz`;

  console.log('🔄 Создание бэкапа базы данных...');
  console.log(`📦 База: ${db.database}`);
  console.log(`🏠 Хост: ${db.host}`);

  // Команда pg_dump с сжатием
  const command = COMPRESS_BACKUPS
    ? `PGPASSWORD="${db.password}" pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F p | gzip > "${compressedFile}"`
    : `PGPASSWORD="${db.password}" pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F p -f "${backupFile}"`;

  try {
    await execAsync(command);
    const finalFile = COMPRESS_BACKUPS ? compressedFile : backupFile;
    console.log(`✅ Бэкап создан: ${finalFile}`);
    
    // Получаем размер файла
    const stats = fs.statSync(finalFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Размер: ${fileSizeMB} MB`);

    return finalFile;
  } catch (error: any) {
    console.error('❌ Ошибка создания бэкапа:', error.message);
    throw error;
  }
}

/**
 * Удаление старых бэкапов
 */
function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('mm05_backup_') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > MAX_BACKUPS) {
    const toDelete = files.slice(MAX_BACKUPS);
    console.log(`🗑️  Удаление старых бэкапов (оставляем ${MAX_BACKUPS} последних)...`);

    toDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`   Удален: ${file.name}`);
    });
  }
}

/**
 * Главная функция
 */
async function main() {
  console.log('\n🔐 MM05 Database Backup Tool\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    ensureBackupDir();
    await createBackup();
    cleanOldBackups();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Бэкап успешно создан!');
    console.log(`📁 Директория: ${BACKUP_DIR}`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error: any) {
    console.error('\n❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();
