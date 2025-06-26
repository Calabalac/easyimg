-- RLS Policies Migration for EasyImg
-- Автоматическое применение политик безопасности

-- ============================================================================
-- 1. ВКЛЮЧАЕМ RLS ДЛЯ ВСЕХ ТАБЛИЦ
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
-- ============================================================================

-- Пользователи могут видеть только свой профиль
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = current_setting('app.current_user_id', true));

-- Пользователи могут обновлять только свой профиль  
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = current_setting('app.current_user_id', true));

-- Админы могут видеть всех пользователей
CREATE POLICY "users_admin_select_all" ON users
    FOR SELECT USING (
        current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- Админы могут обновлять пользователей
CREATE POLICY "users_admin_update_all" ON users
    FOR UPDATE USING (
        current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- Админы могут удалять пользователей
CREATE POLICY "users_admin_delete" ON users
    FOR DELETE USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- Регистрация новых пользователей (только если система не установлена или админ)
CREATE POLICY "users_insert_registration" ON users
    FOR INSERT WITH CHECK (
        -- Разрешаем если система не установлена (первый пользователь)
        NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'installed' AND value = 'true')
        OR 
        -- Или если текущий пользователь - админ
        current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- ============================================================================
-- 3. ПОЛИТИКИ ДЛЯ SYSTEM_SETTINGS
-- ============================================================================

-- Только админы могут читать системные настройки
CREATE POLICY "settings_admin_select" ON system_settings
    FOR SELECT USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- Только админы могут изменять системные настройки
CREATE POLICY "settings_admin_modify" ON system_settings
    FOR ALL USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ============================================================================
-- 4. ПОЛИТИКИ ДЛЯ LOGS
-- ============================================================================

-- Пользователи видят только свои логи
CREATE POLICY "logs_select_own" ON logs
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- Система может создавать логи
CREATE POLICY "logs_system_insert" ON logs
    FOR INSERT WITH CHECK (true);

-- Админы могут удалять старые логи
CREATE POLICY "logs_admin_delete" ON logs
    FOR DELETE USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ============================================================================
-- 5. ПОЛИТИКИ ДЛЯ SUBSCRIPTION_PLANS
-- ============================================================================

-- Все могут видеть активные планы подписок
CREATE POLICY "plans_public_select" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Админы могут управлять планами
CREATE POLICY "plans_admin_manage" ON subscription_plans
    FOR ALL USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ============================================================================
-- 6. ПОЛИТИКИ ДЛЯ USER_SUBSCRIPTIONS  
-- ============================================================================

-- Пользователи видят только свои подписки
CREATE POLICY "subscriptions_select_own" ON user_subscriptions
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- Пользователи могут обновлять свои подписки
CREATE POLICY "subscriptions_update_own" ON user_subscriptions
    FOR UPDATE USING (
        user_id = current_setting('app.current_user_id', true)
        OR current_setting('app.current_user_role', true) IN ('admin', 'manager')
    );

-- Система может создавать подписки
CREATE POLICY "subscriptions_system_insert" ON user_subscriptions
    FOR INSERT WITH CHECK (true);

-- Админы могут удалять подписки
CREATE POLICY "subscriptions_admin_delete" ON user_subscriptions
    FOR DELETE USING (
        current_setting('app.current_user_role', true) = 'admin'
    );

-- ============================================================================
-- 7. ФУНКЦИИ ДЛЯ УСТАНОВКИ КОНТЕКСТА ПОЛЬЗОВАТЕЛЯ
-- ============================================================================

-- Функция для установки текущего пользователя в сессии
CREATE OR REPLACE FUNCTION set_current_user(user_id text, user_role text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, true);
    PERFORM set_config('app.current_user_role', user_role, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения текущего пользователя
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS json AS $$
BEGIN
    RETURN json_build_object(
        'user_id', current_setting('app.current_user_id', true),
        'user_role', current_setting('app.current_user_role', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ПОЛИТИКИ ДЛЯ SERVICE ROLE (обход RLS)
-- ============================================================================

-- Service role может делать все (для системных операций)
-- Эти политики применяются только к anon и authenticated ролям
-- Service role автоматически обходит RLS

-- ============================================================================
-- ЗАВЕРШЕНИЕ МИГРАЦИИ
-- ============================================================================

-- Обновляем системные настройки
INSERT INTO system_settings (key, value, description, encrypted) 
VALUES ('rls_enabled', 'true', 'Row Level Security policies enabled', false)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = CURRENT_TIMESTAMP; 