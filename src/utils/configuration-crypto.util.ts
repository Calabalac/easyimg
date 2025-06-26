import * as crypto from 'crypto';

export class ConfigurationCrypto {
  /**
   * Генерирует случайный секрет
   */
  static generateRandomSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Шифрует текст с помощью AES-256-CBC
   */
  static encrypt(text: string, key: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const keyHash = crypto.createHash('sha256').update(key).digest();
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipher(algorithm, keyHash);
      cipher.setAutoPadding(true);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Дешифрует текст с помощью AES-256-CBC
   */
  static decrypt(encryptedText: string, key: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const keyHash = crypto.createHash('sha256').update(key).digest();

      const [_iv, encrypted] = encryptedText.split(':');

      const decipher = crypto.createDecipher(algorithm, keyHash);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Генерирует контрольную сумму для настроек
   */
  static generateChecksum(settings: any[]): string {
    const settingsString = JSON.stringify(
      settings.sort((a, b) => a.key.localeCompare(b.key)),
    );
    return crypto.createHash('sha256').update(settingsString).digest('hex');
  }

  /**
   * Получает расшифрованное значение из настроек
   */
  static getDecryptedValue(
    settings: any[],
    key: string,
    encryptionKey: string,
  ): string {
    const setting = settings.find((s) => s.key === key);
    if (!setting) return '';

    if (setting.encrypted) {
      return this.decrypt(setting.value, encryptionKey);
    }
    return setting.value;
  }

  /**
   * Получает обычное значение из настроек
   */
  static getPlainValue(settings: any[], key: string): string {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : '';
  }
}
