import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorHandler } from '../utils/error-handler.util';
import { ModuleResponse } from '../interfaces/module.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Изолируем обработку различных типов ошибок
    const errorResponse = this.handleException(exception, request);

    // Логируем ошибку с контекстом
    this.logError(exception, request, errorResponse);

    // Отправляем стандартизированный ответ
    response.status(errorResponse.status).json(errorResponse.body);
  }

  private handleException(
    exception: unknown,
    request: Request,
  ): {
    status: number;
    body: ModuleResponse;
  } {
    // Обработка HTTP исключений
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, request);
    }

    // Обработка ошибок валидации
    if (this.isValidationError(exception)) {
      return this.handleValidationError(exception, request);
    }

    // Обработка ошибок базы данных
    if (this.isDatabaseError(exception)) {
      return this.handleDatabaseError(exception, request);
    }

    // Обработка ошибок аутентификации
    if (this.isAuthError(exception)) {
      return this.handleAuthError(exception, request);
    }

    // Обработка неизвестных ошибок
    return this.handleUnknownError(exception, request);
  }

  private handleHttpException(
    exception: HttpException,
    _request: Request,
  ): {
    status: number;
    body: ModuleResponse;
  } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'An error occurred';
    let details: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const response = exceptionResponse as any;
      message = response.message || response.error || message;
      details = response.details || null;
    }

    return {
      status,
      body: {
        success: false,
        error: message,
        data: details,
        message: `HTTP ${status}: ${message}`,
      },
    };
  }

  private handleValidationError(
    exception: any,
    _request: Request,
  ): {
    status: number;
    body: ModuleResponse;
  } {
    const validationErrors = this.extractValidationErrors(exception);

    return {
      status: HttpStatus.BAD_REQUEST,
      body: {
        success: false,
        error: 'Validation failed',
        data: {
          validationErrors,
          path: _request.url,
        },
        message: 'Request validation failed',
      },
    };
  }

  private handleDatabaseError(
    exception: any,
    request: Request,
  ): {
    status: number;
    body: ModuleResponse;
  } {
    const dbError = ErrorHandler.handleDatabaseError(exception);

    return {
      status: this.getStatusFromDatabaseError(exception),
      body: {
        success: false,
        error: dbError.error || 'Database error',
        data: {
          code: exception.code,
          path: request.url,
        },
        message: 'Database operation failed',
      },
    };
  }

  private handleAuthError(
    exception: any,
    request: Request,
  ): {
    status: number;
    body: ModuleResponse;
  } {
    const authError = ErrorHandler.handleAuthError(exception);

    return {
      status: HttpStatus.UNAUTHORIZED,
      body: {
        success: false,
        error: authError.error || 'Authentication failed',
        data: {
          path: request.url,
          requiresAuth: true,
        },
        message: 'Authentication required',
      },
    };
  }

  private handleUnknownError(
    exception: unknown,
    request: Request,
  ): {
    status: number;
    body: ModuleResponse;
  } {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        success: false,
        error: 'Internal server error',
        data: {
          path: request.url,
          timestamp: new Date().toISOString(),
        },
        message: 'An unexpected error occurred',
      },
    };
  }

  private isValidationError(exception: unknown): boolean {
    return (
      exception instanceof Error &&
      (exception.name === 'ValidationError' ||
        exception.message.includes('validation') ||
        (exception as any).isValidationError === true)
    );
  }

  private isDatabaseError(exception: unknown): boolean {
    return (
      exception instanceof Error &&
      ((exception as any).code?.startsWith?.('PG') ||
        (exception as any).code?.startsWith?.(23) ||
        exception.message.includes('database') ||
        exception.message.includes('relation') ||
        exception.message.includes('constraint'))
    );
  }

  private isAuthError(exception: unknown): boolean {
    return (
      exception instanceof Error &&
      (exception.message.includes('Invalid login credentials') ||
        exception.message.includes('JWT') ||
        exception.message.includes('token') ||
        exception.message.includes('unauthorized'))
    );
  }

  private extractValidationErrors(exception: any): any[] {
    if (exception.errors && Array.isArray(exception.errors)) {
      return exception.errors.map((error: any) => ({
        field: error.property || error.field,
        value: error.value,
        constraints: error.constraints || error.messages,
      }));
    }

    return [
      {
        field: 'unknown',
        value: null,
        constraints: { error: exception.message },
      },
    ];
  }

  private getStatusFromDatabaseError(exception: any): number {
    const code = exception.code;

    if (code === 'PGRST116') return HttpStatus.NOT_FOUND;
    if (code === '23505') return HttpStatus.CONFLICT;
    if (code === '23503') return HttpStatus.BAD_REQUEST;
    if (code === '23514') return HttpStatus.BAD_REQUEST;

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private logError(
    exception: unknown,
    request: Request,
    errorResponse: any,
  ): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';

    const logContext = {
      method,
      url,
      ip,
      userAgent,
      statusCode: errorResponse.status,
      timestamp: new Date().toISOString(),
    };

    if (errorResponse.status >= 500) {
      this.logger.error(
        `${method} ${url} - ${errorResponse.status}`,
        exception instanceof Error ? exception.stack : String(exception),
        logContext,
      );
    } else if (errorResponse.status >= 400) {
      this.logger.warn(
        `${method} ${url} - ${errorResponse.status}`,
        logContext,
      );
    }
  }
}
