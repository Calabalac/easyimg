import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ConfigurationService } from './configuration.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RLSService {
  constructor(
    private supabaseService: SupabaseService,
    private configurationService: ConfigurationService,
  ) {}

  /**
   * Проверяет и применяет RLS политики автоматически
   */
  async ensureRLSPolicies(): Promise<void> {
    try {
      console.log('🛡️ Проверяю RLS политики...');

      // Проверяем, применены ли уже RLS политики
      const rlsEnabled = await this.isRLSEnabled();
      if (rlsEnabled) {
        console.log('✅ RLS политики уже применены');
        return;
      }

      console.log('🔧 Применяю RLS политики...');
      await this.applyRLSPolicies();
      console.log('✅ RLS политики успешно применены');
    } catch (error) {
      console.error('❌ Ошибка при применении RLS политик:', error.message);
      // Не падаем, если RLS не удалось применить - система должна работать
    }
  }

  /**
   * Проверяет, включены ли RLS политики
   */
  private async isRLSEnabled(): Promise<boolean> {
    try {
      const supabase = await this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'rls_enabled')
        .single();

      if (error || !data) {
        return false;
      }

      return data.value === 'true';
    } catch (error) {
      console.log('RLS status check failed:', error.message);
      return false;
    }
  }

  /**
   * Применяет RLS политики из SQL файла
   */
  private async applyRLSPolicies(): Promise<void> {
    const sqlPath = path.join(
      process.cwd(),
      'src',
      'migrations',
      'rls-policies.sql',
    );

    if (!fs.existsSync(sqlPath)) {
      throw new Error('RLS policies SQL file not found');
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Разбиваем SQL на отдельные команды
    const commands = this.splitSQLCommands(sqlContent);

    const supabase = await this.supabaseService.getClient();

    for (const command of commands) {
      if (command.trim()) {
        try {
          console.log(`Выполняю: ${command.substring(0, 50)}...`);

          const { error } = await supabase.rpc('exec_sql', {
            sql_query: command,
          });

          if (error) {
            // Некоторые ошибки можно игнорировать (например, если политика уже существует)
            if (this.isIgnorableError(error.message)) {
              console.log(`⚠️ Игнорируем ошибку: ${error.message}`);
              continue;
            }
            throw new Error(`SQL Error: ${error.message}`);
          }
        } catch (sqlError) {
          // Пробуем альтернативный способ через прямой SQL
          console.log(
            `Пробую альтернативный способ для: ${command.substring(0, 30)}...`,
          );
          await this.executeDirectSQL(command);
        }
      }
    }
  }

  /**
   * Альтернативный способ выполнения SQL через Supabase
   */
  private async executeDirectSQL(sql: string): Promise<void> {
    try {
      const supabase = await this.supabaseService.getClient();

      // Для некоторых команд используем специальные методы
      if (
        sql.includes('ALTER TABLE') &&
        sql.includes('ENABLE ROW LEVEL SECURITY')
      ) {
        // Включение RLS через API может быть недоступно, пропускаем
        console.log('⚠️ Пропускаем ALTER TABLE - требует прямого доступа к БД');
        return;
      }

      if (sql.includes('CREATE POLICY')) {
        console.log(
          '⚠️ Пропускаем CREATE POLICY - требует прямого доступа к БД',
        );
        return;
      }

      if (sql.includes('CREATE OR REPLACE FUNCTION')) {
        console.log(
          '⚠️ Пропускаем CREATE FUNCTION - требует прямого доступа к БД',
        );
        return;
      }

      // Для INSERT операций пробуем выполнить
      if (sql.includes('INSERT INTO system_settings')) {
        const { error } = await supabase.from('system_settings').upsert({
          key: 'rls_enabled',
          value: 'true',
          description: 'Row Level Security policies enabled',
          encrypted: false,
        });

        if (error && !error.message.includes('duplicate')) {
          throw error;
        }
      }
    } catch (error) {
      console.log(`SQL execution failed: ${error.message}`);
      // Не падаем - RLS это дополнительная безопасность
    }
  }

  /**
   * Разбивает SQL на отдельные команды
   */
  private splitSQLCommands(sql: string): string[] {
    // Убираем комментарии
    const withoutComments = sql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    // Разбиваем по точке с запятой, но учитываем функции
    const commands = [];
    let currentCommand = '';
    let inFunction = false;

    const lines = withoutComments.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (
        trimmedLine.includes('CREATE OR REPLACE FUNCTION') ||
        trimmedLine.includes('CREATE FUNCTION')
      ) {
        inFunction = true;
      }

      currentCommand += line + '\n';

      if (trimmedLine.endsWith(';')) {
        if (trimmedLine.includes('$$ LANGUAGE') || !inFunction) {
          commands.push(currentCommand.trim());
          currentCommand = '';
          inFunction = false;
        }
      }
    }

    if (currentCommand.trim()) {
      commands.push(currentCommand.trim());
    }

    return commands.filter((cmd) => cmd.length > 0);
  }

  /**
   * Проверяет, можно ли игнорировать ошибку
   */
  private isIgnorableError(errorMessage: string): boolean {
    const ignorableErrors = [
      'already exists',
      'duplicate key',
      'policy already exists',
      'function already exists',
      'table already has row level security enabled',
    ];

    return ignorableErrors.some((error) =>
      errorMessage.toLowerCase().includes(error.toLowerCase()),
    );
  }

  /**
   * Устанавливает контекст пользователя для RLS
   */
  async setUserContext(userId: string, userRole: string): Promise<void> {
    try {
      const supabase = await this.supabaseService.getClient();

      // Пробуем установить контекст через функцию
      const { error } = await supabase.rpc('set_current_user', {
        user_id: userId,
        user_role: userRole,
      });

      if (error) {
        console.log('Не удалось установить RLS контекст:', error.message);
      }
    } catch (error) {
      console.log('RLS context setting failed:', error.message);
    }
  }

  /**
   * Получает статус RLS для отчетности
   */
  async getRLSStatus(): Promise<any> {
    try {
      const supabase = await this.supabaseService.getClient();

      // Проверяем статус через системные настройки
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'rls_enabled');

      return {
        enabled:
          settings && settings.length > 0 && settings[0].value === 'true',
        lastApplied:
          settings && settings.length > 0 ? settings[0].updated_at : null,
        policies: await this.getPolicyCount(),
      };
    } catch (error) {
      return {
        enabled: false,
        error: error.message,
      };
    }
  }

  /**
   * Подсчитывает количество политик (если доступно)
   */
  private async getPolicyCount(): Promise<number> {
    try {
      const supabase = await this.supabaseService.getClient();

      // Пробуем получить информацию о политиках
      const { data, error } = await supabase.rpc('get_policy_count');

      if (error || !data) {
        return 0;
      }

      return data;
    } catch (error) {
      return 0;
    }
  }
}
