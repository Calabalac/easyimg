import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ModuleResponse } from '../interfaces/module.interface';
import { ERROR_MESSAGES } from '../constants/app.constants';

export class ErrorHandler {
  private static readonly logger = new Logger('ErrorHandler');

  /**
   * Создает стандартизированный ответ об ошибке
   */
  static createErrorResponse<T = any>(
    error: string | Error,
    _statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    data?: T,
  ): ModuleResponse<T> {
    const message = typeof error === 'string' ? error : error.message;

    this.logger.error(
      `Error: ${message}`,
      typeof error === 'object' ? error.stack : undefined,
    );

    return {
      success: false,
      error: message,
      data,
    };
  }

  /**
   * Создает успешный ответ
   */
  static createSuccessResponse<T = any>(
    data?: T,
    message?: string,
  ): ModuleResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Обрабатывает ошибки базы данных
   */
  static handleDatabaseError(error: any): ModuleResponse {
    this.logger.error('Database error:', error);

    if (error.code === 'PGRST116') {
      return this.createErrorResponse(
        ERROR_MESSAGES.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (error.code === '23505') {
      // Unique constraint violation
      return this.createErrorResponse(
        'Resource already exists',
        HttpStatus.CONFLICT,
      );
    }

    if (error.code === '23503') {
      // Foreign key constraint violation
      return this.createErrorResponse(
        'Referenced resource not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.createErrorResponse(
      ERROR_MESSAGES.DATABASE_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Обрабатывает ошибки авторизации
   */
  static handleAuthError(error: any): ModuleResponse {
    this.logger.warn('Auth error:', error.message);

    if (error.message?.includes('Invalid login credentials')) {
      return this.createErrorResponse(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (error.message?.includes('Email not confirmed')) {
      return this.createErrorResponse(
        'Please confirm your email',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.createErrorResponse(
      ERROR_MESSAGES.UNAUTHORIZED,
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * Обрабатывает ошибки валидации
   */
  static handleValidationError(errors: any[]): ModuleResponse {
    const messages = errors
      .map((err) => Object.values(err.constraints || {}).join(', '))
      .join('; ');

    return this.createErrorResponse(
      `Validation failed: ${messages}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Обрабатывает ошибки загрузки файлов
   */
  static handleFileUploadError(error: any): ModuleResponse {
    this.logger.error('File upload error:', error);

    if (error.message?.includes('File too large')) {
      return this.createErrorResponse(
        ERROR_MESSAGES.FILE_TOO_LARGE,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (error.message?.includes('Invalid file type')) {
      return this.createErrorResponse(
        ERROR_MESSAGES.INVALID_FILE_TYPE,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.createErrorResponse(
      ERROR_MESSAGES.UPLOAD_FAILED,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Проверяет, является ли ошибка известной
   */
  static isKnownError(error: any): boolean {
    return (
      error instanceof HttpException ||
      error.code === 'PGRST116' ||
      error.code?.startsWith('23') ||
      error.message?.includes('Invalid login credentials')
    );
  }

  /**
   * Безопасно выполняет асинхронную операцию
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    errorHandler?: (error: any) => ModuleResponse<T>,
  ): Promise<ModuleResponse<T>> {
    try {
      const result = await operation();
      return this.createSuccessResponse(result);
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error);
      }

      if (this.isKnownError(error)) {
        return this.handleDatabaseError(error);
      }

      return this.createErrorResponse(error);
    }
  }

  /**
   * Логирует операцию с контекстом
   */
  static logOperation(
    operation: string,
    context: any = {},
    userId?: string,
  ): void {
    this.logger.log(`Operation: ${operation}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }
}
