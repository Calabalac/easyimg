# 🖼️ EasyImg - Профессиональная система управления изображениями

Современная, безопасная и многофункциональная система управления изображениями, построенная на NestJS и Supabase с поддержкой подписок и комплексными административными инструментами.

## 📋 Содержание

- [🔥 Ключевые особенности](#-ключевые-особенности)
- [🚀 Быстрый старт](#-быстрый-старт)
- [🏗️ Архитектура](#️-архитектура)
- [📊 Функциональность](#-функциональность)
- [🛠️ API Документация](#️-api-документация)
- [🔧 Конфигурация](#-конфигурация)
- [📁 Структура проекта](#-структура-проекта)
- [🎯 Тарифные планы](#-тарифные-планы)
- [🔐 Безопасность](#-безопасность)

## 🔥 Ключевые особенности

### 🎨 Современная архитектура
- **Двойная архитектура**: Handlebars (SSR) + React SPA
- **NestJS Backend**: Модульная архитектура с TypeScript
- **Supabase Database**: PostgreSQL с RLS политиками
- **Vite + React**: Современный фронтенд с hot-reload
- **SWC Compiler**: Ускоренная компиляция (~24% быстрее)

### 🔐 Безопасность и аутентификация
- **JWT токены** с secure cookie handling
- **Роли пользователей**: USER, ADMIN, MANAGER
- **AES-256-CBC шифрование** для чувствительных данных
- **Rate limiting**: 100 req/15min, 5 попыток входа/15min
- **Helmet.js** для security headers
- **bcrypt** хеширование паролей (12 rounds)
- **RLS (Row Level Security)** в базе данных

### 📸 Обработка изображений
- **Sharp** для профессиональной обработки
- **Поддержка форматов**: JPEG, PNG, WebP, GIF
- **Автоматическая оптимизация** и изменение размеров
- **Генерация thumbnail** (300x300px)
- **Безопасное хранение** в Supabase Storage
- **Короткие URL** для быстрого доступа
- **Метаданные**: размеры, теги, описания

### 💳 Система подписок
- **4 тарифных плана**: Free (10), Classic (100), Pro (500), MAX (2000)
- **Автоматическое отслеживание квот** и их применение
- **Месячные циклы** с автоматическим обновлением
- **Интеграция платежей** с iframe поддержкой
- **Админ управление** квотами и планами
- **Статистика использования** в реальном времени

### 👨‍💼 Административная панель
- **Управление пользователями** и назначение ролей
- **Мониторинг подписок** и квот
- **Статистика в реальном времени**
- **Настройка планов** и ценообразования
- **Системный мониторинг** и логи
- **Rate limiting** конфигурация
- **Backup/Restore** конфигурации

### 🎨 Современный UI/UX
- **DaisyUI + Tailwind CSS** для стилизации
- **Responsive design** с mobile-first подходом
- **Dark/Light theme** поддержка
- **Интуитивные интерфейсы** для всех ролей
- **Профессиональные pricing страницы**
- **Drag & Drop** загрузка файлов

### ⚙️ Простое развертывание
- **Web-based setup wizard**
- **Docker support** с docker-compose
- **Автоматическое создание** схемы БД
- **One-click конфигурация**
- **Локальный деплой** для разработки

## 🚀 Быстрый старт

### 📋 Требования
- Node.js 18+
- npm или yarn
- Аккаунт Supabase
- Docker (опционально)

## 🟢 Быстрый старт Supabase (инициализация структуры БД)

1. Откройте ваш проект в Supabase.
2. Перейдите в раздел **SQL Editor**.
3. Скопируйте и вставьте приведённый ниже скрипт в окно редактора.
4. Нажмите **RUN**.
5. После выполнения скрипта база будет полностью готова для работы с EasyImg.

```sql
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'user', -- 'user' | 'manager' | 'admin'
  email_verified boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  encrypted boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- LOGS
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL, -- 'info' | 'warn' | 'error' | 'debug'
  message text NOT NULL,
  context jsonb,
  user_id uuid,
  user_email text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_quota integer NOT NULL,
  max_file_size integer NOT NULL,
  allowed_formats text[] NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL,
  features text[] NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- USER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  status text NOT NULL, -- 'active' | 'expired' | 'cancelled' | 'pending'
  images_uploaded integer NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- IMAGES
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  filename text NOT NULL,
  file_path text NOT NULL,
  mimetype text NOT NULL,
  size integer NOT NULL,
  width integer,
  height integer,
  short_url text UNIQUE NOT NULL,
  tags text[],
  description text,
  status text NOT NULL, -- 'uploading' | 'processing' | 'ready' | 'error' | 'deleted'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_user_id ON user_subscriptions(user_id);

-- ВКЛЮЧАЕМ RLS ДЛЯ ВСЕХ ТАБЛИЦ
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ПОЛИТИКИ ДЛЯ USERS
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id::text = current_setting('app.current_user_id', true));
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id::text = current_setting('app.current_user_id', true));
CREATE POLICY "users_admin_select_all" ON users
    FOR SELECT USING (
        current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );
CREATE POLICY "users_admin_update_all" ON users
    FOR UPDATE USING (
        current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );
CREATE POLICY "users_admin_delete" ON users
    FOR DELETE USING (
        current_setting('app.current_user_role', true) = 'admin'
    );
CREATE POLICY "users_insert_registration" ON users
    FOR INSERT WITH CHECK (
        NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'installed' AND value = 'true')
        OR 
        current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- ПОЛИТИКИ ДЛЯ SYSTEM_SETTINGS
CREATE POLICY "settings_admin_select" ON system_settings
    FOR SELECT USING (
        current_setting('app.current_user_role', true) = 'admin'
    );
CREATE POLICY "settings_admin_modify" ON system_settings
    FOR ALL USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ПОЛИТИКИ ДЛЯ LOGS
CREATE POLICY "logs_select_own" ON logs
    FOR SELECT USING (
        user_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );
CREATE POLICY "logs_system_insert" ON logs
    FOR INSERT WITH CHECK (true);
CREATE POLICY "logs_admin_delete" ON logs
    FOR DELETE USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ПОЛИТИКИ ДЛЯ SUBSCRIPTION_PLANS
CREATE POLICY "plans_public_select" ON subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "plans_admin_manage" ON subscription_plans
    FOR ALL USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ПОЛИТИКИ ДЛЯ USER_SUBSCRIPTIONS
CREATE POLICY "subscriptions_select_own" ON user_subscriptions
    FOR SELECT USING (
        user_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );
CREATE POLICY "subscriptions_update_own" ON user_subscriptions
    FOR UPDATE USING (
        user_id::text = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );
CREATE POLICY "subscriptions_system_insert" ON user_subscriptions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "subscriptions_admin_delete" ON user_subscriptions
    FOR DELETE USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ФУНКЦИИ ДЛЯ УСТАНОВКИ КОНТЕКСТА ПОЛЬЗОВАТЕЛЯ
CREATE OR REPLACE FUNCTION set_current_user(user_id text, user_role text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, true);
    PERFORM set_config('app.current_user_role', user_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user()
RETURNS json AS $$
BEGIN
    RETURN json_build_object(
        'user_id', current_setting('app.current_user_id', true),
        'user_role', current_setting('app.current_user_role', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем системные настройки
INSERT INTO system_settings (key, value, description, encrypted) 
VALUES ('rls_enabled', 'true', 'Row Level Security policies enabled', false)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = CURRENT_TIMESTAMP; 
```

## 🔧 Конфигурация

### 🌐 Web-based Setup

> С версии 2.0 проект использует файл `.env` для всех основных настроек. Веб-интерфейс может использоваться для первичной инициализации, но все ключевые параметры должны быть прописаны в `.env` (см. раздел выше).

### 🗄️ База данных
Автоматическое создание таблиц:
- `users` - пользователи с ролями
- `user_subscriptions` - подписки пользователей
- `subscription_plans` - тарифные планы
- `system_settings` - настройки системы
- `logs` - системные логи

### 🔐 Безопасность
- Все настройки шифруются AES-256-CBC
- RLS политики для защиты данных
- JWT секреты автогенерируются
- Rate limiting по умолчанию

## 📁 Структура проекта

```
easyimg/
├── src/                    # Backend (NestJS)
│   ├── controllers/        # HTTP контроллеры
│   ├── services/          # Бизнес логика
│   ├── guards/            # Защита маршрутов
│   ├── middleware/        # Промежуточное ПО
│   ├── dto/               # Data Transfer Objects
│   ├── interfaces/        # TypeScript интерфейсы
│   ├── enums/             # Перечисления
│   └── utils/             # Утилиты
├── frontend/              # Frontend (React SPA)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/      # API сервисы
│   │   ├── store/         # Zustand store
│   │   └── types/         # TypeScript типы
│   ├── public/            # Статические файлы
│   └── dist/              # Собранный фронтенд
├── views/                 # Handlebars шаблоны (SSR)
│   ├── admin/             # Админ панель
│   ├── auth/              # Аутентификация
│   └── layouts/           # Макеты страниц
├── uploads/               # Загруженные файлы
├── metadata/              # Метаданные изображений
└── logs/                  # Логи приложения
```

## 🎯 Тарифные планы

| План | Изображений/месяц | Цена | Особенности |
|------|------------------|------|-------------|
| **Free** | 10 | $0 | Базовая поддержка, стандартное качество |
| **Classic** | 100 | $9.99 | Приоритетная поддержка, высокое качество, API доступ |
| **Pro** | 500 | $29.99 | 24/7 поддержка, ультра качество, расширенный API, кастомные домены |
| **MAX** | 2000 | $99.99 | Выделенная поддержка, премиум качество, полный API, white-label, SLA |

### 💎 Особенности планов
- **Автоматическое отслеживание** квот
- **Месячные циклы** с обновлением
- **Upgrade/Downgrade** в любое время
- **Админ override** для особых случаев
- **Детальная статистика** использования

## 🔐 Безопасность

### 🛡️ Меры защиты
- **JWT токены** в httpOnly cookies
- **AES-256-CBC** шифрование конфигурации
- **bcrypt** хеширование паролей (12 rounds)
- **Rate limiting**: 100 req/15min, 5 попыток входа/15min
- **Helmet.js** security headers
- **Input validation** с class-validator
- **RLS политики** в Supabase
- **CORS** настройки для SPA

### 🔒 Роли и разрешения
- **USER**: Загрузка изображений, управление своими файлами
- **ADMIN**: Полный доступ к админ панели, управление пользователями
- **MANAGER**: Управление подписками, просмотр статистики

### 🚨 Мониторинг
- **Системные логи** в реальном времени
- **Аудит действий** пользователей
- **Мониторинг производительности**
- **Алерты** по превышению квот

## 🤝 Разработка

### 🔧 Локальная разработка
```bash
# Установка
git clone https://github.com/Calabalac/easyimg.git
cd easyimg
npm install
cd frontend && npm install && cd ..

# Запуск в режиме разработки
npm run deploy:local

# Тестирование
npm run test
npm run test:e2e
```

### 📝 Вклад в проект
1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. [LICENSE](LICENSE) файл.

## 👨‍💻 Автор

**Yaroslav**
- Telegram: [@Calabalac](https://t.me/Calabalac)
- GitHub: [Calabalac](https://github.com/Calabalac)

## 🙏 Благодарности

- NestJS команде за превосходный фреймворк
- Supabase за backend-as-a-service платформу
- DaisyUI и Tailwind CSS за красивые UI компоненты
- Всем контрибьюторам и пользователям проекта

---

⭐ **Поставьте звезду, если проект был полезен!**

🚀 **EasyImg - Профессиональное управление изображениями стало простым!**

## ⚙️ Конфигурация через .env

Файл `.env` необходим для корректной работы backend и хранения всех чувствительных и специфичных для окружения параметров.

**Где хранить:**
- Файл `.env` должен находиться в папке `easyimg/` (корень backend).
- Не размещайте `.env` в публичных репозиториях.

**Как создать:**
1. Скопируйте шаблон (если есть):
   ```bash
   cp .env.example .env
   ```
   Или создайте вручную:
   ```bash
   nano .env
   ```
2. Заполните переменные согласно примеру ниже.

**Как использовать:**
- Все параметры (ключи, порты, секреты, настройки Supabase и др.) должны быть прописаны в `.env`.
- Приложение автоматически подхватит значения при запуске.
- Для production обязательно используйте уникальные значения и секреты.

**Пример содержимого .env:**
```
NODE_ENV=development
PORT=8347
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
JWT_SECRET=your-generated-secret-64-chars-minimum
DOMAIN=localhost
PROTOCOL=http
SITE_NAME=EasyImg
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
BCRYPT_ROUNDS=12
```

**Безопасность:**
- Не коммитьте `.env` в репозиторий!
- Для генерации JWT секрета:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
