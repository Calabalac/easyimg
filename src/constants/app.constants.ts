/**
 * Константы приложения
 */

// Роли пользователей
export const USER_ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

// Планы подписок
export const SUBSCRIPTION_PLANS = {
  FREE: 'Free',
  CLASSIC: 'Classic',
  PRO: 'Pro',
  MAX: 'MAX',
} as const;

// Лимиты для планов подписок
export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_PLANS.FREE]: {
    imagesPerMonth: 50,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
  },
  [SUBSCRIPTION_PLANS.CLASSIC]: {
    imagesPerMonth: 500,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  [SUBSCRIPTION_PLANS.PRO]: {
    imagesPerMonth: 2000,
    maxFileSize: 25 * 1024 * 1024, // 25MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  },
  [SUBSCRIPTION_PLANS.MAX]: {
    imagesPerMonth: -1, // Unlimited
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'],
  },
} as const;

// Статусы изображений
export const IMAGE_STATUS = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
  DELETED: 'deleted',
} as const;

// Размеры миниатюр
export const THUMBNAIL_SIZES = {
  SMALL: { width: 150, height: 150 },
  MEDIUM: { width: 300, height: 300 },
  LARGE: { width: 600, height: 600 },
} as const;

// Пути файлов
export const FILE_PATHS = {
  UPLOADS: './uploads',
  METADATA: './metadata',
  THUMBNAILS: './uploads/thumbnails',
  TEMP: './temp',
} as const;

// Настройки JWT
export const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
  ALGORITHM: 'HS256',
} as const;

// Настройки rate limiting (по умолчанию безлимит для тестирования)
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 0, // 0 = безлимит (для тестирования)
    recommended: 100, // рекомендуемое значение для продакшена
  },
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 0, // 0 = безлимит (для тестирования)
    recommended: 20, // рекомендуемое значение для продакшена
  },
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 час
    max: 0, // 0 = безлимит (для тестирования)
    recommended: 50, // рекомендуемое значение для продакшена
  },
} as const;

// Сообщения об ошибках
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  QUOTA_EXCEEDED: 'Quota exceeded',
  FILE_TOO_LARGE: 'File too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'Upload failed',
  DATABASE_ERROR: 'Database error',
  CONFIGURATION_ERROR: 'Configuration error',
} as const;

// Успешные сообщения
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  IMAGE_UPLOADED: 'Image uploaded successfully',
  IMAGE_DELETED: 'Image deleted successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
} as const;

// Типы событий системы
export const SYSTEM_EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  IMAGE_UPLOADED: 'image.uploaded',
  IMAGE_DELETED: 'image.deleted',
  QUOTA_EXCEEDED: 'quota.exceeded',
  CONFIG_CHANGED: 'config.changed',
  SYSTEM_ERROR: 'system.error',
} as const;
