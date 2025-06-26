export enum UserRole {
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export const RoleLabels = {
  [UserRole.USER]: 'Пользователь',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.ADMIN]: 'Администратор',
};

export const RoleDescriptions = {
  [UserRole.USER]: 'Базовые права: загрузка изображений в рамках тарифа',
  [UserRole.MANAGER]:
    'Расширенные права: управление пользователями, просмотр статистики',
  [UserRole.ADMIN]: 'Полные права: все функции системы, безлимитная загрузка',
};
