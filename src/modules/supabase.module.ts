import { Module } from '@nestjs/common';
import { SupabaseService } from '../services/supabase.service';
import { ConfigurationModule } from './configuration.module';

@Module({
  imports: [ConfigurationModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
