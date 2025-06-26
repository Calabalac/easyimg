import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class JwtCookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Извлекаем токен из cookie и добавляем в заголовок Authorization
    const token = req.cookies?.token;

    if (token && !req.headers.authorization) {
      req.headers.authorization = `Bearer ${token}`;
      console.log('🍪 Токен извлечен из cookie для:', req.method, req.path);
    }

    next();
  }
}
