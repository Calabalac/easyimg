import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AppConfiguration } from '../interfaces/configuration.interface';
import { ConfigurationCrypto } from './configuration-crypto.util';

export class ConfigurationLoader {
  private static readonly installMarkerPath = join(process.cwd(), '.installed');

  /**
   * Проверяет, установлена ли система
   */
  static async isInstalled(configService: ConfigService): Promise<boolean> {
    // Если есть файл маркер - точно установлена
    if (existsSync(this.installMarkerPath)) {
      return true;
    }

    // Проверяем переменные окружения (Coolify может устанавливать их автоматически)
    const envConfig = this.getConfigFromEnv(configService);
    if (envConfig.supabaseUrl && envConfig.supabaseServiceKey) {
      try {
        console.log(
          '🔍 Checking database for existing configuration with env vars...',
        );
        const hasSettings = await this.checkDatabaseSettingsWithKeys(
          envConfig.supabaseUrl,
          envConfig.supabaseServiceKey,
        );
        if (hasSettings) {
          console.log(
            '✅ Found existing configuration in database, auto-restoring...',
          );
          this.markAsInstalled();
          return true;
        }
      } catch (error) {
        console.log('❌ Database check failed:', error.message);
      }
    }

    return false;
  }

  /**
   * Получает конфигурацию из переменных окружения
   */
  static getConfigFromEnv(configService: ConfigService): AppConfiguration {
    return {
      supabaseUrl: configService.get<string>('SUPABASE_URL') || '',
      supabaseServiceKey:
        configService.get<string>('SUPABASE_SERVICE_KEY') || '',
      supabaseAnonKey: configService.get<string>('SUPABASE_ANON_KEY') || '',
      supabaseJwtSecret: configService.get<string>('SUPABASE_JWT_SECRET') || '',
      jwtSecret:
        configService.get<string>('JWT_SECRET') ||
        ConfigurationCrypto.generateRandomSecret(),
      siteName: configService.get<string>('SITE_NAME') || 'EasyImg',
      domain: configService.get<string>('DOMAIN') || 'http://localhost:8347',
    };
  }

  /**
   * Загружает конфигурацию из базы данных
   */
  static async loadFromDatabase(
    configService: ConfigService,
  ): Promise<AppConfiguration> {
    // Используем временный клиент с настройками из окружения
    const envConfig = this.getConfigFromEnv(configService);

    if (!envConfig.supabaseUrl || !envConfig.supabaseServiceKey) {
      throw new Error(
        'Отсутствуют базовые настройки Supabase в переменных окружения',
      );
    }

    const tempClient = createClient(
      envConfig.supabaseUrl,
      envConfig.supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'X-Client-Info': 'easyimg-config-loader',
          },
        },
      },
    );

    // Загружаем зашифрованные настройки
    const { data: settings, error } = await tempClient
      .from('system_settings')
      .select('*')
      .in('key', [
        'supabase_url',
        'supabase_service_key',
        'supabase_anon_key',
        'supabase_jwt_secret',
        'jwt_secret',
        'site_name',
        'domain',
        'encryption_key',
      ]);

    if (error) {
      throw new Error(`Ошибка загрузки настроек: ${error.message}`);
    }

    if (!settings || settings.length === 0) {
      throw new Error('Настройки не найдены в базе данных');
    }

    // Получаем ключ шифрования
    const encryptionKeySetting = settings.find(
      (s) => s.key === 'encryption_key',
    );
    if (!encryptionKeySetting) {
      throw new Error('Ключ шифрования не найден');
    }

    const encryptionKey = ConfigurationCrypto.decrypt(
      encryptionKeySetting.value,
      envConfig.jwtSecret,
    );

    // Расшифровываем настройки
    const config: AppConfiguration = {
      supabaseUrl:
        ConfigurationCrypto.getDecryptedValue(
          settings,
          'supabase_url',
          encryptionKey,
        ) || envConfig.supabaseUrl,
      supabaseServiceKey:
        ConfigurationCrypto.getDecryptedValue(
          settings,
          'supabase_service_key',
          encryptionKey,
        ) || envConfig.supabaseServiceKey,
      supabaseAnonKey:
        ConfigurationCrypto.getDecryptedValue(
          settings,
          'supabase_anon_key',
          encryptionKey,
        ) || envConfig.supabaseAnonKey,
      supabaseJwtSecret:
        ConfigurationCrypto.getDecryptedValue(
          settings,
          'supabase_jwt_secret',
          encryptionKey,
        ) || envConfig.supabaseJwtSecret,
      jwtSecret:
        ConfigurationCrypto.getDecryptedValue(
          settings,
          'jwt_secret',
          encryptionKey,
        ) || envConfig.jwtSecret,
      siteName:
        ConfigurationCrypto.getPlainValue(settings, 'site_name') ||
        envConfig.siteName,
      domain:
        ConfigurationCrypto.getPlainValue(settings, 'domain') ||
        envConfig.domain,
    };

    return config;
  }

  /**
   * Проверяет наличие настроек в базе данных с конкретными ключами
   */
  private static async checkDatabaseSettingsWithKeys(
    supabaseUrl: string,
    serviceKey: string,
  ): Promise<boolean> {
    const tempClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: settings, error } = await tempClient
      .from('system_settings')
      .select('key')
      .eq('key', 'encryption_key')
      .limit(1);

    return !error && settings && settings.length > 0;
  }

  /**
   * Создает файл маркер установки
   */
  private static markAsInstalled(): void {
    try {
      writeFileSync(this.installMarkerPath, new Date().toISOString());
      console.log('📝 Created installation marker file');
    } catch (error) {
      console.error('Failed to create installation marker:', error);
    }
  }
}
