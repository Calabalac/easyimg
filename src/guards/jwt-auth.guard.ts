import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    if (err || !user) {
      // Для браузерных запросов делаем редирект на страницу входа
      if (request.headers.accept && request.headers.accept.includes('text/html')) {
        response.redirect('/auth/login');
        return;
      }
      
      // Для API запросов возвращаем JSON ошибку
      throw err || new UnauthorizedException('Требуется авторизация');
    }
    return user;
  }
}
