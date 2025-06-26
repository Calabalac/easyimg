import { Module } from '@nestjs/common';
import { ConfigurationService } from '../services/configuration.service';
import { SupabaseModule } from './supabase.module';
import { ValidationUtil } from '../utils/validation.util';
import { ErrorHandler } from '../utils/error-handler.util';
import { ConfigurationLoader } from '../utils/configuration-loader.util';
import { ConfigurationCrypto } from '../utils/configuration-crypto.util';
import { FunctionIsolation } from '../utils/function-isolation.util';

@Module({
  imports: [SupabaseModule],
  providers: [
    ConfigurationService,
    {
      provide: 'validation',
      useClass: ValidationUtil,
    },
    {
      provide: 'errorHandler',
      useClass: ErrorHandler,
    },
    {
      provide: 'configLoader',
      useClass: ConfigurationLoader,
    },
    {
      provide: 'crypto',
      useClass: ConfigurationCrypto,
    },
    {
      provide: 'isolation',
      useClass: FunctionIsolation,
    },
  ],
  exports: [ConfigurationService],
})
export class UtilsModule {}
