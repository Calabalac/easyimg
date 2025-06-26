import { ModuleResponse } from '../interfaces/module.interface';
import {
  USER_ROLES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_LIMITS,
} from '../constants/app.constants';

/**
 * Утилиты для валидации данных без побочных эффектов
 */
export class ValidationUtil {
  /**
   * Валидирует email адрес
   */
  static validateEmail(email: string): ModuleResponse<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return {
      success: isValid,
      data: isValid,
      error: isValid ? undefined : 'Invalid email format',
    };
  }

  /**
   * Валидирует пароль
   */
  static validatePassword(password: string): ModuleResponse<boolean> {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors: string[] = [];

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    const isValid = errors.length === 0;

    return {
      success: isValid,
      data: isValid,
      error: isValid ? undefined : errors.join(', '),
    };
  }

  /**
   * Валидирует роль пользователя
   */
  static validateUserRole(role: string): ModuleResponse<boolean> {
    const validRoles = Object.values(USER_ROLES);
    const isValid = validRoles.includes(role as any);

    return {
      success: isValid,
      data: isValid,
      error: isValid
        ? undefined
        : `Invalid role. Must be one of: ${validRoles.join(', ')}`,
    };
  }

  /**
   * Валидирует план подписки
   */
  static validateSubscriptionPlan(plan: string): ModuleResponse<boolean> {
    const validPlans = Object.values(SUBSCRIPTION_PLANS);
    const isValid = validPlans.includes(plan as any);

    return {
      success: isValid,
      data: isValid,
      error: isValid
        ? undefined
        : `Invalid plan. Must be one of: ${validPlans.join(', ')}`,
    };
  }

  /**
   * Валидирует размер файла для плана подписки
   */
  static validateFileSize(
    fileSize: number,
    plan: string,
  ): ModuleResponse<boolean> {
    const planLimits =
      SUBSCRIPTION_LIMITS[plan as keyof typeof SUBSCRIPTION_LIMITS];

    if (!planLimits) {
      return {
        success: false,
        data: false,
        error: 'Invalid subscription plan',
      };
    }

    const isValid = fileSize <= planLimits.maxFileSize;

    return {
      success: isValid,
      data: isValid,
      error: isValid
        ? undefined
        : `File size ${fileSize} bytes exceeds limit of ${planLimits.maxFileSize} bytes`,
    };
  }

  /**
   * Валидирует формат файла для плана подписки
   */
  static validateFileFormat(
    fileExtension: string,
    plan: string,
  ): ModuleResponse<boolean> {
    const planLimits =
      SUBSCRIPTION_LIMITS[plan as keyof typeof SUBSCRIPTION_LIMITS];

    if (!planLimits) {
      return {
        success: false,
        data: false,
        error: 'Invalid subscription plan',
      };
    }

    const normalizedExtension = fileExtension.toLowerCase().replace('.', '');
    const isValid = planLimits.allowedFormats.includes(
      normalizedExtension as any,
    );

    return {
      success: isValid,
      data: isValid,
      error: isValid
        ? undefined
        : `File format ${fileExtension} not allowed for ${plan} plan. Allowed: ${planLimits.allowedFormats.join(', ')}`,
    };
  }

  /**
   * Валидирует URL
   */
  static validateUrl(url: string): ModuleResponse<boolean> {
    try {
      new URL(url);
      return {
        success: true,
        data: true,
      };
    } catch {
      return {
        success: false,
        data: false,
        error: 'Invalid URL format',
      };
    }
  }

  /**
   * Валидирует UUID
   */
  static validateUuid(uuid: string): ModuleResponse<boolean> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = uuidRegex.test(uuid);

    return {
      success: isValid,
      data: isValid,
      error: isValid ? undefined : 'Invalid UUID format',
    };
  }

  /**
   * Валидирует объект по схеме
   */
  static validateObject<T>(
    obj: any,
    schema: Record<string, (value: any) => ModuleResponse<boolean>>,
  ): ModuleResponse<T> {
    const errors: string[] = [];

    for (const [key, validator] of Object.entries(schema)) {
      if (!(key in obj)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      const result = validator(obj[key]);
      if (!result.success) {
        errors.push(`${key}: ${result.error}`);
      }
    }

    const isValid = errors.length === 0;

    return {
      success: isValid,
      data: isValid ? (obj as T) : undefined,
      error: isValid ? undefined : errors.join(', '),
    };
  }

  /**
   * Валидирует массив элементов
   */
  static validateArray<T>(
    arr: any[],
    itemValidator: (item: any) => ModuleResponse<boolean>,
  ): ModuleResponse<T[]> {
    if (!Array.isArray(arr)) {
      return {
        success: false,
        data: undefined,
        error: 'Input is not an array',
      };
    }

    const errors: string[] = [];

    arr.forEach((item, index) => {
      const result = itemValidator(item);
      if (!result.success) {
        errors.push(`Item ${index}: ${result.error}`);
      }
    });

    const isValid = errors.length === 0;

    return {
      success: isValid,
      data: isValid ? (arr as T[]) : undefined,
      error: isValid ? undefined : errors.join(', '),
    };
  }

  /**
   * Создает композитный валидатор
   */
  static compose(
    ...validators: Array<(value: any) => ModuleResponse<boolean>>
  ): (value: any) => ModuleResponse<boolean> {
    return (value: any): ModuleResponse<boolean> => {
      for (const validator of validators) {
        const result = validator(value);
        if (!result.success) {
          return result;
        }
      }

      return {
        success: true,
        data: true,
      };
    };
  }

  /**
   * Санитизирует строку (удаляет опасные символы)
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Удаляем HTML теги
      .replace(/['"]/g, '') // Удаляем кавычки
      .replace(/[&]/g, '&amp;') // Экранируем амперсанды
      .trim(); // Убираем пробелы по краям
  }

  /**
   * Валидирует и санитизирует входные данные
   */
  static validateAndSanitize(
    input: string,
    validator: (value: string) => ModuleResponse<boolean>,
  ): ModuleResponse<string> {
    const sanitized = this.sanitizeString(input);
    const validationResult = validator(sanitized);

    return {
      success: validationResult.success,
      data: validationResult.success ? sanitized : undefined,
      error: validationResult.error,
    };
  }
}
