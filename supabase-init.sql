-- EasyImg: Полная инициализация структуры Supabase
-- Просто скопируйте и выполните этот скрипт в SQL Editor Supabase
-- ВАЖНО: Этот скрипт удаляет все старые таблицы и создаёт новые с нуля!

-- Удаление старых таблиц (если есть)
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

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