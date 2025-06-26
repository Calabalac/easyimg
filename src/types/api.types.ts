/**
 * Строгие типы для API
 */

import { ModuleResponse } from '../interfaces/module.interface';

// Базовые типы для HTTP
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 500;

// Типы для аутентификации
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends ModuleResponse {
  data?: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    token: string;
    redirectUrl: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse extends ModuleResponse {
  data?: {
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

// Типы для загрузки изображений
export interface ImageUploadRequest {
  file: Express.Multer.File;
  tags?: string[];
  description?: string;
}

export interface ImageUploadResponse extends ModuleResponse {
  data?: {
    id: string;
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
    shortUrl: string;
    directUrl: string;
    uploadedAt: string;
  };
}

export interface ImageListRequest {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'size' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ImageListResponse extends ModuleResponse {
  data?: {
    images: Array<{
      id: string;
      originalName: string;
      filename: string;
      size: number;
      mimetype: string;
      shortUrl: string;
      directUrl: string;
      uploadedAt: string;
      tags?: string[];
      description?: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ImageUpdateRequest {
  tags?: string[];
  description?: string;
}

export interface ImageDeleteResponse extends ModuleResponse {
  data?: {
    deleted: boolean;
    id: string;
  };
}

// Типы для подписок
export interface SubscriptionInfoResponse extends ModuleResponse {
  data?: {
    plan: string;
    status: string;
    imagesUploaded: number;
    imageQuota: number;
    quotaUsagePercent: number;
    daysRemaining: number;
    features: string[];
  };
}

export interface SubscriptionPlansResponse extends ModuleResponse {
  data?: Array<{
    id: string;
    name: string;
    description: string;
    imageQuota: number;
    price: number;
    currency: string;
    features: string[];
    paymentUrl?: string;
  }>;
}

// Типы для администрирования
export interface AdminStatsResponse extends ModuleResponse {
  data?: {
    users: {
      total: number;
      active: number;
      admins: number;
    };
    images: {
      total: number;
      totalSize: number;
      averageSize: number;
    };
    subscriptions: {
      free: number;
      classic: number;
      pro: number;
      max: number;
    };
    system: {
      uptime: number;
      memoryUsage: number;
      diskUsage: number;
    };
  };
}

export interface AdminUserListResponse extends ModuleResponse {
  data?: {
    users: Array<{
      id: string;
      email: string;
      role: string;
      active: boolean;
      createdAt: string;
      lastLogin?: string;
      imagesCount: number;
      subscription: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AdminUserUpdateRequest {
  role?: 'user' | 'manager' | 'admin';
  active?: boolean;
  subscription?: string;
}

// Типы для статуса системы
export interface SystemStatusResponse extends ModuleResponse {
  data?: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    version: string;
    database: {
      connected: boolean;
      responseTime: number;
    };
    storage: {
      used: number;
      available: number;
      percentage: number;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    services: Array<{
      name: string;
      status: 'running' | 'stopped' | 'error';
      lastCheck: string;
    }>;
  };
}

// Типы для ошибок
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
  method: HttpMethod;
}

export interface ValidationError {
  field: string;
  value: any;
  message: string;
  code: string;
}

// Типы для пагинации
export interface PaginationRequest {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Типы для фильтрации
export interface FilterRequest {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
}

// Типы для сортировки
export interface SortRequest {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Комбинированные типы для запросов
export interface ListRequest
  extends PaginationRequest,
    FilterRequest,
    SortRequest {}

// Типы для middleware
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RequestWithFile extends Request {
  file: Express.Multer.File;
}

export interface RequestWithFiles extends Request {
  files: Express.Multer.File[];
}
