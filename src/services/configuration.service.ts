import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AppConfiguration,
} from '../interfaces/configuration.interface';
import { ConfigurationLoader } from '../utils/configuration-loader.util';
import { ConfigurationCrypto } from '../utils/configuration-crypto.util';
import { SupabaseService } from './supabase.service';
import { DatabaseSystemSetting } from '../types/database.types';

@Injectable()
export class ConfigurationService {
  private config: AppConfiguration | null = null;
  private isLoaded = false;

  constructor(private configService: ConfigService) {}

  /**
   * Проверяет, установлена ли система
   */
  async isInstalled(): Promise<boolean> {
    return ConfigurationLoader.isInstalled(this.configService);
  }

  /**
   * Загружает конфигурацию из базы данных или переменных окружения
   */
  async loadConfiguration(): Promise<AppConfiguration> {
    if (this.isLoaded && this.config) {
      return this.config;
    }

    // If system is not installed, use environment variables
    if (!(await this.isInstalled())) {
      this.config = ConfigurationLoader.getConfigFromEnv(this.configService);
      this.isLoaded = true;
      return this.config;
    }

    try {
      // Load from database
      this.config = await ConfigurationLoader.loadFromDatabase(
        this.configService,
      );
      this.isLoaded = true;
      return this.config;
    } catch (error) {
      console.warn(
        'Failed to load configuration from database, using environment variables:',
        error.message,
      );
      this.config = ConfigurationLoader.getConfigFromEnv(this.configService);
      this.isLoaded = true;
      return this.config;
    }
  }

  /**
   * Получает текущую конфигурацию
   */
  getCurrentConfig(): AppConfiguration | null {
    return this.config;
  }

  /**
   * Сбрасывает кэш конфигурации
   */
  resetCache(): void {
    this.config = null;
    this.isLoaded = false;
  }

  /**
   * Создает Supabase клиент с текущей конфигурацией
   */
  async createSupabaseClient(): Promise<SupabaseClient> {
    const config = await this.loadConfiguration();

    if (!config.supabaseUrl || !config.supabaseServiceKey) {
      throw new Error('Supabase configuration is incomplete');
    }

    return createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'easyimg-app',
        },
      },
    });
  }

  /**
   * Проверяет, настроен ли Supabase
   */
  async isSupabaseConfigured(): Promise<boolean> {
    try {
      const config = await this.loadConfiguration();
      return !!(config.supabaseUrl && config.supabaseServiceKey);
    } catch {
      return false;
    }
  }

  /**
   * Получает JWT секрет
   */
  async getJwtSecret(): Promise<string> {
    const config = await this.loadConfiguration();

    if (!config.jwtSecret) {
      // Генерируем новый секрет если его нет
      const newSecret = ConfigurationCrypto.generateRandomSecret();
      config.jwtSecret = newSecret;
      return newSecret;
    }

    return config.jwtSecret;
  }

  /**
   * Получение конфигурации для внутреннего использования
   */
  async getAppConfiguration(): Promise<AppConfiguration> {
    return {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',
      jwtSecret: process.env.JWT_SECRET || '',
      siteName: process.env.SITE_NAME || 'EasyImg',
      domain: process.env.DOMAIN || 'localhost:8347',
    };
  }

  /**
   * Получение настройки из базы данных
   */
  async getSetting(key: string): Promise<string | null> {
    try {
      const supabase = await this.createSupabaseClient();
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        console.warn(`Failed to get setting ${key}:`, error.message);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Установка настройки в базу данных
   */
  async setSetting(key: string, value: string, description?: string): Promise<void> {
    try {
      const supabase = await this.createSupabaseClient();
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          description: description || '',
          encrypted: false,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error(`Failed to set setting ${key}: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error.message);
      throw error;
    }
  }
}
