import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { RATE_LIMITS } from '../constants/app.constants';

export interface RateLimitConfig {
  general: {
    windowMs: number;
    max: number;
    enabled: boolean;
  };
  login: {
    windowMs: number;
    max: number;
    enabled: boolean;
  };
  upload: {
    windowMs: number;
    max: number;
    enabled: boolean;
  };
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private configurationService: ConfigurationService) {}

  async getRateLimitConfig(): Promise<RateLimitConfig> {
    try {
      const config =
        await this.configurationService.getSetting('rate_limit_config');

      if (config) {
        return JSON.parse(config);
      }
    } catch (error) {
      this.logger.warn(
        'Failed to load rate limit config, using defaults:',
        error.message,
      );
    }

    // Возвращаем конфигурацию по умолчанию (безлимит для тестирования)
    return {
      general: {
        windowMs: RATE_LIMITS.GENERAL.windowMs,
        max: RATE_LIMITS.GENERAL.max, // 0 = безлимит
        enabled: RATE_LIMITS.GENERAL.max > 0,
      },
      login: {
        windowMs: RATE_LIMITS.LOGIN.windowMs,
        max: RATE_LIMITS.LOGIN.max, // 0 = безлимит
        enabled: RATE_LIMITS.LOGIN.max > 0,
      },
      upload: {
        windowMs: RATE_LIMITS.UPLOAD.windowMs,
        max: RATE_LIMITS.UPLOAD.max, // 0 = безлимит
        enabled: RATE_LIMITS.UPLOAD.max > 0,
      },
    };
  }

  async updateRateLimitConfig(config: RateLimitConfig): Promise<void> {
    try {
      await this.configurationService.setSetting(
        'rate_limit_config',
        JSON.stringify(config),
      );
      this.logger.log('Rate limit configuration updated successfully');
    } catch (error) {
      this.logger.error('Failed to update rate limit config:', error.message);
      throw error;
    }
  }

  getRecommendedValues() {
    return {
      general: {
        windowMs: RATE_LIMITS.GENERAL.windowMs,
        max: RATE_LIMITS.GENERAL.recommended,
        description:
          'Общий лимит запросов (рекомендуется 100 запросов за 15 минут для продакшена)',
      },
      login: {
        windowMs: RATE_LIMITS.LOGIN.windowMs,
        max: RATE_LIMITS.LOGIN.recommended,
        description:
          'Лимит попыток входа (рекомендуется 20 попыток за 15 минут для продакшена)',
      },
      upload: {
        windowMs: RATE_LIMITS.UPLOAD.windowMs,
        max: RATE_LIMITS.UPLOAD.recommended,
        description:
          'Лимит загрузок файлов (рекомендуется 50 загрузок за час для продакшена)',
      },
    };
  }

  formatWindowMs(windowMs: number): string {
    const minutes = Math.floor(windowMs / (60 * 1000));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours} час${hours > 1 ? 'а' : ''}`;
    }
    return `${minutes} минут${minutes > 1 ? '' : 'а'}`;
  }
}
