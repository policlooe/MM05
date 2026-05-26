@echo off
cd /d "%~dp0"
echo Generating package-lock.json...
call npm install --package-lock-only
echo Done!
pause
