// Конфигурация по умолчанию - все настройки теперь в админке
export const appConfig = {
  jwtSecret:
    'easyimg-default-jwt-secret-' + Math.random().toString(36).substring(2),
  jwtExpiresIn: '7d',
  domain: 'localhost:8347',
  protocol: 'http',
  storageUrl: '/uploads',
  port: 8347,
};
