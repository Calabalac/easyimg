# 🌐 КОНФИГУРАЦИЯ ПОРТОВ - EasyImg

## 🔌 Уникальные порты системы

Система EasyImg использует специально выбранные уникальные порты для избежания конфликтов с другими проектами:

### 📊 Таблица портов

| Сервис | Порт | Стандартный порт | Описание |
|--------|------|------------------|----------|
| **API сервер** | `8347` | 3000 | NestJS backend API |
| **React SPA** | `8348` | 5173 | Vite development server |

### ✅ Преимущества уникальных портов

- **Отсутствие конфликтов** с другими проектами
- **Параллельное тестирование** нескольких проектов
- **Стабильная работа** в многопроектной среде
- **Легкая идентификация** процессов

### 🔍 Проверка портов

```bash
# Проверка занятости портов
netstat -an | findstr ":8347"    # API сервер
netstat -an | findstr ":8348"    # Frontend сервер

# Альтернативная проверка (PowerShell)
Get-NetTCPConnection -LocalPort 8347 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 8348 -ErrorAction SilentlyContinue
```

### 🚀 Доступ к системе

После запуска `npm run deploy:local`:

- **Главная страница**: http://localhost:8347
- **React SPA** (рекомендуется): http://localhost:8348
- **Setup wizard**: http://localhost:8347/setup
- **Админ панель**: http://localhost:8348/admin
- **API документация**: http://localhost:8347/api
- **Health check**: http://localhost:8347/health

### 🛠️ Изменение портов

Если необходимо изменить порты, обновите следующие файлы:

1. **API сервер** (`src/main.ts`, `src/main-api.ts`):
   ```typescript
   const port = process.env.PORT || 8347;
   ```

2. **Frontend** (`frontend/vite.config.ts`):
   ```typescript
   server: {
     port: 8348,
     proxy: {
       '/api': 'http://localhost:8347',
       // ...
     }
   }
   ```

3. **Batch файлы** (`start-local-deploy.bat`, `stop-local-deploy.bat`)
4. **Документация** (README.md, РЕГЛАМЕНТ.md)

### 🔧 Переменные окружения

Порты можно переопределить через переменные окружения:

```bash
# API сервер
PORT=8347 npm run start:api

# Frontend (в папке frontend)
cd frontend
VITE_PORT=8348 npm run dev
```

### 🚨 Устранение неполадок

**Проблема**: Порт уже занят
```bash
# Найти процесс
netstat -ano | findstr :8347

# Завершить процесс (замените PID)
taskkill /PID <PID> /F
```

**Проблема**: Не удается подключиться
1. Проверьте firewall
2. Убедитесь что сервер запущен
3. Проверьте логи в консоли

---

📝 **Примечание**: При изменении портов обязательно обновите все конфигурационные файлы и документацию для поддержания консистентности системы.
