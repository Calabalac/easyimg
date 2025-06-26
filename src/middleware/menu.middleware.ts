import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class MenuMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let userRole: UserRole | null = null;
    let isAuthenticated = false;

    // Проверяем JWT токен из cookies
    const token = req.cookies?.jwt_token;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'your-secret-key',
        ) as any;
        userRole = decoded.role;
        isAuthenticated = true;
      } catch (error) {
        // Токен недействителен
        userRole = null;
        isAuthenticated = false;
      }
    }

    // Формируем меню на основе роли пользователя
    const menuItems = [];

    // Главная страница - всегда доступна
    menuItems.push({
      label: 'Главная',
      href: '/',
      active: req.path === '/',
    });

    if (isAuthenticated) {
      // Меню для авторизованных пользователей
      menuItems.push({
        label: 'Личный кабинет',
        href: '/dashboard',
        active: req.path.startsWith('/dashboard'),
      });

      // Админ-панель только для админов и менеджеров
      if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
        menuItems.push({
          label: 'Админ-панель',
          href: '/admin',
          active: req.path.startsWith('/admin'),
        });
      }
    } else {
      // Меню для неавторизованных пользователей
      menuItems.push(
        {
          label: 'Тарифы',
          href: '/pricing',
          active: req.path === '/pricing',
        },
        {
          label: 'Вход',
          href: '/auth/login',
          active: req.path === '/auth/login',
        },
        {
          label: 'Регистрация',
          href: '/auth/register',
          active: req.path === '/auth/register',
        },
      );
    }

    // Добавляем данные меню в locals для использования в шаблонах
    res.locals.menuItems = menuItems;
    res.locals.isAuthenticated = isAuthenticated;
    res.locals.userRole = userRole;

    next();
  }
}
