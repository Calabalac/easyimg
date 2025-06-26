/**
 * Интерфейсы для взаимодействия между модулями
 */

// Базовый интерфейс для всех ответов модулей
export interface ModuleResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Интерфейс для пользователя (общий для всех модулей)
export interface ModuleUser {
  id: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  active: boolean;
}

// Интерфейс для авторизации
export interface AuthModuleInterface {
  validateUser(payload: any): Promise<ModuleUser | null>;
  login(
    email: string,
    password: string,
  ): Promise<ModuleResponse<{ token: string; user: ModuleUser }>>;
  register(
    email: string,
    password: string,
  ): Promise<ModuleResponse<ModuleUser>>;
}

// Интерфейс для работы с изображениями
export interface ImageModuleInterface {
  uploadImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<ModuleResponse<any>>;
  getUserImages(userId: string, query?: any): Promise<ModuleResponse<any[]>>;
  deleteImage(imageId: string, userId: string): Promise<ModuleResponse>;
}

// Интерфейс для подписок
export interface SubscriptionModuleInterface {
  getUserSubscription(userId: string): Promise<ModuleResponse<any>>;
  checkQuota(
    userId: string,
    action: string,
  ): Promise<ModuleResponse<{ allowed: boolean; remaining?: number }>>;
  updateUsage(
    userId: string,
    action: string,
    amount?: number,
  ): Promise<ModuleResponse>;
}

// Интерфейс для конфигурации
export interface ConfigurationModuleInterface {
  getConfiguration(): Promise<ModuleResponse<any>>;
  updateConfiguration(key: string, value: any): Promise<ModuleResponse>;
  isInstalled(): Promise<boolean>;
}

// Интерфейс для базы данных
export interface DatabaseModuleInterface {
  getClient(): Promise<any>;
  testConnection(): Promise<ModuleResponse>;
  executeQuery(query: string, params?: any[]): Promise<ModuleResponse<any>>;
}

// События между модулями
export interface ModuleEvent {
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
}

// Типы событий
export enum ModuleEventType {
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  IMAGE_UPLOADED = 'image.uploaded',
  IMAGE_DELETED = 'image.deleted',
  QUOTA_EXCEEDED = 'quota.exceeded',
  CONFIG_CHANGED = 'config.changed',
  SYSTEM_ERROR = 'system.error',
}
