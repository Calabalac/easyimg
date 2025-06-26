/**
 * Утилиты для изоляции функций и устранения побочных эффектов
 */

// Тип для чистых функций (без побочных эффектов)
export type PureFunction<T, R> = (input: T) => R;
export type AsyncPureFunction<T, R> = (input: T) => Promise<R>;

/**
 * Класс для создания изолированных функций
 */
export class FunctionIsolation {
  /**
   * Создает изолированную копию объекта (deep clone)
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as T;
    }

    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * Создает immutable версию функции
   */
  static makeImmutable<T, R>(fn: (input: T) => R): PureFunction<T, R> {
    return (input: T): R => {
      const clonedInput = this.deepClone(input);
      return fn(clonedInput);
    };
  }

  /**
   * Создает безопасную версию функции с обработкой ошибок
   */
  static makeSafe<T, R>(
    fn: PureFunction<T, R>,
    defaultValue: R,
  ): PureFunction<T, R> {
    return (input: T): R => {
      try {
        return fn(input);
      } catch (error) {
        console.warn(
          'Function execution failed, returning default value:',
          error,
        );
        return defaultValue;
      }
    };
  }
}
