<#
.SYNOPSIS
  Локальный PostgreSQL для MM05: без установки в систему и без прав администратора.

.DESCRIPTION
  Кластер и бинарники живут в <repo>/.localdb (в git не попадает).
  Порт 5433, пользователь postgres, trust-аутентификация только на 127.0.0.1.
  База: mm05_dev.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/local-db.ps1 start
  powershell -ExecutionPolicy Bypass -File scripts/local-db.ps1 stop
  powershell -ExecutionPolicy Bypass -File scripts/local-db.ps1 status
#>
param(
  [ValidateSet('start', 'stop', 'status')]
  [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
# Данные и бинарники — вне репозитория: путь проекта содержит кириллицу и «—»,
# а initdb/pg_ctl на Windows не умеют работать с таким путём.
$base = Join-Path $env:LOCALAPPDATA 'mm05-localdb'
$bin = Join-Path $base 'pgsql\bin'
$data = Join-Path $base 'data'
$log = Join-Path $base 'postgres.log'
$port = 5433
$database = 'mm05_dev'

function Test-DbPort {
  param([int]$Port)

  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

switch ($Action) {
  'start' {
    if (-not (Test-Path (Join-Path $bin 'pg_ctl.exe'))) {
      throw "Не найдены бинарники PostgreSQL в $bin. Смотри docs/local-database.md"
    }

    if (-not (Test-Path (Join-Path $data 'PG_VERSION'))) {
      Write-Host 'Инициализация кластера...'
      & (Join-Path $bin 'initdb.exe') -D $data -U postgres --auth=trust -E UTF8 --locale=C | Out-Null
    }

    if (Test-DbPort $port) {
      Write-Host "PostgreSQL уже слушает 127.0.0.1:$port"
      break
    }

    if (Test-Path (Join-Path $data 'postmaster.pid')) {
      Remove-Item (Join-Path $data 'postmaster.pid') -Force -ErrorAction SilentlyContinue
    }

    $ctlArgs = "-D `"$data`" -o `"-p $port`" -l `"$log`" -w start"
    $pgCtl = Start-Process -FilePath (Join-Path $bin 'pg_ctl.exe') -ArgumentList $ctlArgs -WindowStyle Hidden -PassThru
    $pgCtl.WaitForExit(30000) | Out-Null

    if ($pgCtl.ExitCode -ne 0) {
      throw "pg_ctl завершился с кодом $($pgCtl.ExitCode). Лог: $log"
    }

    Write-Host "PostgreSQL запущен: 127.0.0.1:$port (данные: $data)"
    Write-Host "DATABASE_URL=postgresql://postgres@127.0.0.1:$port/$database"
  }

  'stop' {
    if (-not (Test-DbPort $port)) {
      Write-Host 'PostgreSQL не запущен'
      break
    }

    & (Join-Path $bin 'pg_ctl.exe') -D $data -m fast -w stop | Out-Null
    Write-Host 'PostgreSQL остановлен'
  }

  'status' {
    if (Test-DbPort $port) {
      Write-Host "PostgreSQL слушает 127.0.0.1:$port"
      Write-Host "Лог: $log"
    } else {
      Write-Host 'PostgreSQL не запущен'
    }
  }
}
