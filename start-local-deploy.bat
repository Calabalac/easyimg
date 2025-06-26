@echo off
echo 🚀 EasyImg - Локальный деплой
echo ==============================

echo 📦 Проверяем зависимости...
if not exist "node_modules" (
    echo ❌ Backend зависимости не установлены
    echo 🔧 Устанавливаем зависимости...
    call npm install
)

if not exist "frontend\node_modules" (
    echo ❌ Frontend зависимости не установлены  
    echo 🔧 Устанавливаем зависимости фронтенда...
    cd frontend && call npm install && cd ..
)

echo ✅ Зависимости готовы

echo 🔧 Создаем папку логов...
if not exist "logs" mkdir logs

echo 🚀 Запускаем серверы...
echo 📍 API сервер: http://localhost:8347
echo 📍 React SPA: http://localhost:8348
echo 📍 Логи: logs\deploy.log

start /B npm run start:api > logs\api.log 2>&1
timeout /t 3 /nobreak > nul
cd frontend && start /B npm run dev > ..\logs\frontend.log 2>&1 && cd ..

echo ⏳ Ожидаем запуска серверов...
timeout /t 10 /nobreak > nul

echo 🌐 Открываем браузер...
start http://localhost:8348

echo ✅ Деплой завершен!
echo 📋 Для остановки используйте: npm run stop:local
echo 📊 Логи API: logs\api.log
echo 📊 Логи Frontend: logs\frontend.log

pause 