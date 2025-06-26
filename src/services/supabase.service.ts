import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigurationService } from './configuration.service';
import { User } from '../interfaces/user.interface';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly requestTimeout: number;

  constructor(
    private configService: ConfigService,
    private configurationService: ConfigurationService,
  ) {
    // Получаем настройки из переменных окружения
    this.retryAttempts = parseInt(process.env.SUPABASE_RETRY_ATTEMPTS || '3');
    this.retryDelay = parseInt(process.env.SUPABASE_RETRY_DELAY || '2000');
    this.requestTimeout = parseInt(
      process.env.SUPABASE_REQUEST_TIMEOUT || '30000',
    );
  }

  /**
   * Получает или создает Supabase клиент
   */
  async getClient(): Promise<SupabaseClient> {
    if (!this.supabase) {
      // Если система не установлена, проверяем базовую конфигурацию из env
      if (!this.configurationService.isInstalled()) {
        const config = await this.configurationService.loadConfiguration();
        if (!config.supabaseUrl || !config.supabaseServiceKey) {
          throw new Error(
            'Supabase not configured. Please check your environment variables.',
          );
        }
      }
      this.supabase = await this.configurationService.createSupabaseClient();
    }
    return this.supabase;
  }

  /**
   * Сбрасывает клиент (для переинициализации после изменения настроек)
   */
  resetClient(): void {
    this.supabase = null;
  }

  /**
   * Выполняет запрос с retry логикой и таймаутом
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'Database operation',
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(
          `🔄 ${operationName} - attempt ${attempt}/${this.retryAttempts}`,
        );

        // Добавляем таймаут для операции
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  `${operationName} timeout after ${this.requestTimeout}ms`,
                ),
              ),
            this.requestTimeout,
          );
        });

        const result = await Promise.race([operation(), timeoutPromise]);
        console.log(`✅ ${operationName} completed successfully`);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(
          `⚠️ ${operationName} failed (attempt ${attempt}/${this.retryAttempts}):`,
          error.message,
        );

        // Проверяем, стоит ли повторять попытку
        const shouldRetry = this.shouldRetryError(error);

        if (!shouldRetry || attempt === this.retryAttempts) {
          break;
        }

        // Ждем перед следующей попыткой
        console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      }
    }

    console.error(
      `❌ ${operationName} failed after ${this.retryAttempts} attempts`,
    );
    throw lastError;
  }

  /**
   * Определяет, стоит ли повторять попытку при данной ошибке
   */
  private shouldRetryError(error: any): boolean {
    if (!error || !error.message) return false;

    const errorMessage = error.message.toLowerCase();
    const retryableErrors = [
      'rate limit',
      'too many',
      'timeout',
      'connection',
      'network',
      'temporary',
      'unavailable',
      'overloaded',
    ];

    return retryableErrors.some((keyword) => errorMessage.includes(keyword));
  }

  // Пользователи
  async getUsers(): Promise<User[]> {
    try {
      return await this.executeWithRetry(async () => {
        const supabase = await this.getClient();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      }, 'getUsers');
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserById(id: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    return this.executeWithRetry(async () => {
      console.log('🔍 Getting user by email:', email);
      const supabase = await this.getClient();

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Database error:', error);
        throw error;
      }

      return data;
    }, `getUserByEmail(${email})`);
  }

  async createUser(userData: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string) {
    const supabase = await this.getClient();
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;
    return true;
  }

  // Настройки системы
  async getSystemSettings(): Promise<any[]> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return [];
    }
  }

  async updateSystemSetting(key: string, value: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Логирование
  async createLog(
    level: string,
    message: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const supabase = await this.getClient();
      await supabase.from('system_logs').insert([
        {
          level,
          message,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to create log:', error);
    }
  }

  async getLogs(limit = 100) {
    const supabase = await this.getClient();

    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('⚠️ Ошибка загрузки логов:', error.message);
        // Возвращаем пустой массив если таблица не существует или есть проблемы со схемой
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('⚠️ Ошибка загрузки логов:', error.message);
      return [];
    }
  }
}
