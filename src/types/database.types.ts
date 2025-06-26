/**
 * Строгие типы для базы данных
 */

// Базовые типы для таблиц
export interface DatabaseUser {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'manager' | 'admin';
  email_verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSystemSetting {
  id?: number;
  key: string;
  value: string;
  encrypted: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseImage {
  id: string;
  user_id: string;
  original_name: string;
  filename: string;
  file_path: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  short_url: string;
  tags?: string[];
  description?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubscriptionPlan {
  id: string;
  name: string;
  description: string;
  image_quota: number;
  max_file_size: number;
  allowed_formats: string[];
  price: number;
  currency: string;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  images_uploaded: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Типы для запросов
export interface DatabaseQuery {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  data?: Record<string, any>;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface DatabaseResponse<T = any> {
  data: T | T[] | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  count?: number;
  status: number;
  statusText: string;
}

// Типы для RLS политик
export interface RLSPolicy {
  name: string;
  table: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  role?: string;
  using?: string;
  with_check?: string;
  enabled: boolean;
}

// Типы для миграций
export interface DatabaseMigration {
  version: string;
  name: string;
  sql: string;
  rollback_sql?: string;
  executed_at?: string;
}

// Утилитарные типы
export type DatabaseTableName =
  | 'users'
  | 'system_settings'
  | 'images'
  | 'subscription_plans'
  | 'user_subscriptions'
  | 'logs';

export type DatabaseOperation =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'upsert';

export type DatabaseFilter = {
  [key: string]: any;
};

export type DatabaseSortOrder = 'asc' | 'desc';

// Типы для конфигурации подключения
export interface DatabaseConfig {
  url: string;
  serviceKey: string;
  anonKey: string;
  jwtSecret: string;
  schema?: string;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

// Типы для статистики
export interface DatabaseStats {
  totalUsers: number;
  totalImages: number;
  totalStorage: number;
  activeSubscriptions: number;
  recentErrors: number;
  uptime: number;
}
