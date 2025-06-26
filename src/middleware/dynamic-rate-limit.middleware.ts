import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class DynamicRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DynamicRateLimitMiddleware.name);
  private generalLimiter: any = null;
  private loginLimiter: any = null;
  private uploadLimiter: any = null;
  private lastConfigUpdate = 0;
  private readonly CONFIG_CACHE_TIME = 60000; // 1 минута

  constructor(private rateLimitService: RateLimitService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Обновляем лимитеры если прошло достаточно времени или они не инициализированы
      const now = Date.now();
      if (
        !this.generalLimiter ||
        now - this.lastConfigUpdate > this.CONFIG_CACHE_TIME
      ) {
        await this.updateLimiters();
        this.lastConfigUpdate = now;
      }

      // Выбираем нужный лимитер в зависимости от пути
      let limiter = null;

      if (req.path === '/auth/login') {
        limiter = this.loginLimiter;
      } else if (req.path.includes('/api/images/upload')) {
        limiter = this.uploadLimiter;
      } else {
        limiter = this.generalLimiter;
      }

      // Применяем лимитер если он активен
      if (limiter) {
        return limiter(req, res, next);
      } else {
        // Если лимитер отключен, пропускаем запрос
        return next();
      }
    } catch (error) {
      this.logger.error('Rate limit middleware error:', error.message);
      // В случае ошибки пропускаем запрос
      return next();
    }
  }

  private async updateLimiters() {
    try {
      const config = await this.rateLimitService.getRateLimitConfig();

      // Создаем общий лимитер
      this.generalLimiter = config.general.enabled
        ? rateLimit({
            windowMs: config.general.windowMs,
            max: config.general.max,
            message: 'Слишком много запросов с вашего IP, попробуйте позже',
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: this.getKeyGenerator(),
          })
        : null;

      // Создаем лимитер для входа
      this.loginLimiter = config.login.enabled
        ? rateLimit({
            windowMs: config.login.windowMs,
            max: config.login.max,
            message: 'Слишком много попыток входа, попробуйте позже',
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: true,
            keyGenerator: this.getKeyGenerator(),
          })
        : null;

      // Создаем лимитер для загрузок
      this.uploadLimiter = config.upload.enabled
        ? rateLimit({
            windowMs: config.upload.windowMs,
            max: config.upload.max,
            message: 'Слишком много загрузок с вашего IP, попробуйте позже',
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: this.getKeyGenerator(),
          })
        : null;

      this.logger.log('Rate limiters updated successfully');
    } catch (error) {
      this.logger.error('Failed to update rate limiters:', error.message);
    }
  }

  private getKeyGenerator() {
    return (req: Request) => {
      // Используем X-Forwarded-For если доступен, иначе IP подключения
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded
        ? Array.isArray(forwarded)
          ? forwarded[0]
          : forwarded.split(',')[0]
        : req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
      return ip;
    };
  }
}
