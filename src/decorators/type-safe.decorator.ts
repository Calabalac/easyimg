import { SetMetadata } from '@nestjs/common';

// Метаданные для type safety
export const TYPE_SAFE_KEY = 'type_safe';

// Декоратор для обеспечения type safety метода
export const TypeSafe = (options?: {
  validateInput?: boolean;
  validateOutput?: boolean;
  logErrors?: boolean;
}) => SetMetadata(TYPE_SAFE_KEY, options || {});
