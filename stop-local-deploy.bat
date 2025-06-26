@echo off
echo 🛑 EasyImg - Остановка серверов
echo ================================

echo 🔍 Ищем процессы NestJS...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo table /nh ^| findstr nest') do (
    echo 🛑 Останавливаем NestJS процесс %%i
    taskkill /PID %%i /F >nul 2>&1
)

echo 🔍 Ищем процессы Vite...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo table /nh ^| findstr vite') do (
    echo 🛑 Останавливаем Vite процесс %%i
    taskkill /PID %%i /F >nul 2>&1
)

echo 🔍 Останавливаем все Node.js процессы на портах 8347 и 8348...
netstat -ano | findstr :8347 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8347 ^| findstr LISTENING') do (
        echo 🛑 Останавливаем процесс на порту 8347: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

netstat -ano | findstr :8348 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8348 ^| findstr LISTENING') do (
        echo 🛑 Останавливаем процесс на порту 8348: %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo ✅ Все серверы остановлены
echo 📊 Логи сохранены в папке logs/

pause 